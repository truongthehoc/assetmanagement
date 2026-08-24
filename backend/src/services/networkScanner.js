const net = require('net');
const http = require('http');
const https = require('https');
const os = require('os');

// Standard Ports for Network Asset Discovery
const PORT_PROFILES = {
  PRINTER: [9100, 515, 631],        // JetDirect, LPD, IPP
  WEB_ADMIN: [80, 443, 8080, 8443], // Embedded Web Server
  SNMP: [161],                      // SNMP Management
  SWITCH_ROUTER: [22, 23],           // SSH / Telnet Management
  CAMERA: [554, 8000]               // RTSP / Video Stream
};

/**
 * Get active IPv4 local network subnets of the host machine
 */
function getLocalSubnets() {
  const interfaces = os.networkInterfaces();
  const subnets = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ipParts = iface.address.split('.');
        if (ipParts.length === 4) {
          const baseSubnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;
          subnets.push({
            name,
            ip: iface.address,
            netmask: iface.netmask,
            subnet: baseSubnet,
            startIp: `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.1`,
            endIp: `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.254`
          });
        }
      }
    }
  }

  // Prefer physical interfaces (Wi-Fi, Ethernet) over virtual/VPN interfaces like Tailscale
  subnets.sort((a, b) => {
    const aIsVpn = a.name.toLowerCase().includes('tailscale') || a.name.toLowerCase().includes('vEthernet') || a.name.toLowerCase().includes('vbox');
    const bIsVpn = b.name.toLowerCase().includes('tailscale') || b.name.toLowerCase().includes('vEthernet') || b.name.toLowerCase().includes('vbox');
    if (aIsVpn && !bIsVpn) return 1;
    if (!aIsVpn && bIsVpn) return -1;
    return 0;
  });

  // Fallback default if none detected
  if (subnets.length === 0) {
    subnets.push({
      name: 'Default Subnet',
      ip: '10.30.22.48',
      netmask: '255.255.255.0',
      subnet: '10.30.22.0/24',
      startIp: '10.30.22.1',
      endIp: '10.30.22.254'
    });
  }

  return subnets;
}

/**
 * Bulletproof TCP Port Check with hard safety timer wrapper
 */
function checkPort(ip, port, timeoutMs = 300) {
  return new Promise((resolve) => {
    let resolved = false;
    const socket = new net.Socket();

    const done = (status) => {
      if (!resolved) {
        resolved = true;
        try {
          socket.destroy();
        } catch (e) {}
        resolve(status ? port : null);
      }
    };

    // Hard safety timer prevents socket hanging on unroutable IPs
    const timer = setTimeout(() => {
      done(false);
    }, timeoutMs + 50);

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      clearTimeout(timer);
      done(true);
    });

    socket.on('timeout', () => {
      clearTimeout(timer);
      done(false);
    });

    socket.on('error', () => {
      clearTimeout(timer);
      done(false);
    });

    socket.on('close', () => {
      clearTimeout(timer);
      done(false);
    });

    try {
      socket.connect(port, ip);
    } catch (err) {
      clearTimeout(timer);
      done(false);
    }
  });
}

/**
 * Bulletproof HTTP Banner / Title Fetcher
 */
function fetchHttpHeaderOrTitle(ip, port = 80, timeoutMs = 500) {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (val) => {
      if (!resolved) {
        resolved = true;
        resolve(val || { title: '', server: '' });
      }
    };

    const timer = setTimeout(() => {
      done({ title: '', server: '' });
    }, timeoutMs + 50);

    const protocol = (port === 443 || port === 8443) ? https : http;
    try {
      const req = protocol.get(
        {
          host: ip,
          port: port,
          path: '/',
          timeout: timeoutMs,
          headers: { 'User-Agent': 'ITAssetGuard-Scanner/1.0' },
          rejectUnauthorized: false
        },
        (res) => {
          let data = '';
          const serverHeader = res.headers['server'] || res.headers['Server'] || '';

          res.on('data', (chunk) => {
            data += chunk.toString();
            if (data.length > 2048) {
              try { req.destroy(); } catch (e) {}
              clearTimeout(timer);
              let title = '';
              const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/i);
              if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim();
              }
              done({ title, server: serverHeader });
            }
          });

          res.on('end', () => {
            clearTimeout(timer);
            let title = '';
            const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1].trim();
            }
            done({ title, server: serverHeader });
          });

          res.on('error', () => {
            clearTimeout(timer);
            done({ title: '', server: serverHeader });
          });
        }
      );

      req.on('timeout', () => {
        try { req.destroy(); } catch (e) {}
        clearTimeout(timer);
        done({ title: '', server: '' });
      });

      req.on('error', () => {
        try { req.destroy(); } catch (e) {}
        clearTimeout(timer);
        done({ title: '', server: '' });
      });
    } catch (err) {
      clearTimeout(timer);
      done({ title: '', server: '' });
    }
  });
}

/**
 * Classify device based on open ports and HTTP title/server header
 */
function identifyDeviceType(ip, openPorts, httpInfo = { title: '', server: '' }) {
  const title = (httpInfo.title || '').toLowerCase();
  const server = (httpInfo.server || '').toLowerCase();

  const printerKeywords = [
    'hp', 'laserjet', 'epson', 'canon', 'brother', 'ricoh', 'xerox',
    'kyocera', 'lexmark', 'pagewide', 'inkjet', 'printer', 'copier', 'mfp', 'scanner'
  ];

  const networkKeywords = [
    'cisco', 'mikrotik', 'tp-link', 'd-link', 'aruba', 'ubiquiti',
    'fortinet', 'switch', 'router', 'gateway', 'openwrt', 'pfsense'
  ];

  const cameraKeywords = [
    'hikvision', 'dahua', 'axis', 'camera', 'nvr', 'dvr', 'reolink', 'uniview'
  ];

  // 1. Check HTTP title / Server header match
  for (const kw of printerKeywords) {
    if (title.includes(kw) || server.includes(kw)) {
      return {
        assetType: 'Máy in / Scanner',
        vendor: title.length > 0 ? httpInfo.title : 'Network Printer / Scanner',
        osName: `Embedded Web Server (${httpInfo.title || 'Printer'})`
      };
    }
  }

  for (const kw of networkKeywords) {
    if (title.includes(kw) || server.includes(kw)) {
      return {
        assetType: 'Thiết bị mạng (Switch/Router)',
        vendor: title.length > 0 ? httpInfo.title : 'Network Switch / Router',
        osName: `Network OS (${httpInfo.title || 'Switch/Router'})`
      };
    }
  }

  for (const kw of cameraKeywords) {
    if (title.includes(kw) || server.includes(kw)) {
      return {
        assetType: 'IP Camera / IoT',
        vendor: title.length > 0 ? httpInfo.title : 'IP Camera / DVR',
        osName: `Embedded Linux (IP Camera)`
      };
    }
  }

  // 2. Check Open Ports heuristics
  const hasPrinterPort = openPorts.some(p => PORT_PROFILES.PRINTER.includes(p));
  if (hasPrinterPort) {
    return {
      assetType: 'Máy in / Scanner',
      vendor: httpInfo.title || 'Network Printer (JetDirect/IPP/LPD)',
      osName: 'Embedded JetDirect / Print Server'
    };
  }

  const hasCameraPort = openPorts.some(p => PORT_PROFILES.CAMERA.includes(p));
  if (hasCameraPort) {
    return {
      assetType: 'IP Camera / IoT',
      vendor: httpInfo.title || 'IP Camera (RTSP Stream)',
      osName: 'Embedded IP Camera'
    };
  }

  const hasSwitchPort = openPorts.some(p => PORT_PROFILES.SWITCH_ROUTER.includes(p));
  if (hasSwitchPort) {
    return {
      assetType: 'Thiết bị mạng (Switch/Router)',
      vendor: httpInfo.title || 'Network Device (SSH/Telnet)',
      osName: 'Network Managed Device'
    };
  }

  if (openPorts.includes(80) || openPorts.includes(443) || openPorts.includes(8080)) {
    return {
      assetType: 'Thiết bị IT khác',
      vendor: httpInfo.title || `Web Managed Node (${ip})`,
      osName: `Embedded Web Console (${httpInfo.title || 'HTTP'})`
    };
  }

  return {
    assetType: 'Thiết bị IT khác',
    vendor: `Network Node (${ip})`,
    osName: 'Network Connected Device'
  };
}

/**
 * Scan a single IP address against target ports
 */
async function scanSingleIp(ip, portsToScan = [9100, 515, 631, 80, 443, 8080, 22, 23, 554]) {
  const openPortResults = await Promise.all(
    portsToScan.map(port => checkPort(ip, port, 300))
  );

  const openPorts = openPortResults.filter(p => p !== null);

  if (openPorts.length === 0) {
    return null; // IP inactive or ports closed
  }

  let httpInfo = { title: '', server: '' };
  const webPort = openPorts.find(p => [80, 443, 8080, 8443].includes(p));
  if (webPort) {
    httpInfo = await fetchHttpHeaderOrTitle(ip, webPort, 400);
  }

  const classification = identifyDeviceType(ip, openPorts, httpInfo);

  // Generate friendly Hostname
  let hostname = classification.vendor || `NET-DEV-${ip.replace(/\./g, '')}`;
  if (classification.assetType === 'Máy in / Scanner' && !hostname.toLowerCase().includes('máy in') && !hostname.toLowerCase().includes('printer')) {
    hostname = `Máy In / Scanner (${ip})`;
  } else if (classification.assetType === 'Thiết bị mạng (Switch/Router)' && !hostname.toLowerCase().includes('switch')) {
    hostname = `Switch / Router (${ip})`;
  }

  return {
    ip,
    hostname,
    agentId: `NETSCAN-${ip}`,
    serialNumber: `NET-SN-${ip.replace(/\./g, '')}`,
    osName: classification.osName,
    assetType: classification.assetType,
    openPorts,
    httpTitle: httpInfo.title || null,
    hardwareJson: JSON.stringify({
      deviceType: classification.assetType,
      openPorts,
      vendorInfo: classification.vendor,
      httpTitle: httpInfo.title || null
    }),
    softwareJson: JSON.stringify([
      { name: classification.osName, version: 'Embedded/Network', publisher: classification.vendor }
    ])
  };
}

/**
 * Scan a range of IP addresses concurrently in high-speed batches
 */
async function scanSubnetRange(startIp, endIp, portsToScan, batchSize = 50, onProgress = null) {
  const ipToLong = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  const longToIp = (long) => [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');

  const startLong = ipToLong(startIp);
  const endLong = ipToLong(endIp);

  if (startLong > endLong) {
    throw new Error('IP Bắt đầu phải nhỏ hơn hoặc bằng IP Kết thúc');
  }

  // Cap scan at 512 IPs per request for safety
  const maxIps = Math.min(endLong - startLong + 1, 512);

  const allIps = [];
  for (let i = 0; i < maxIps; i++) {
    allIps.push(longToIp(startLong + i));
  }

  const discoveredDevices = [];
  let processedCount = 0;

  for (let i = 0; i < allIps.length; i += batchSize) {
    const batch = allIps.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(ip => scanSingleIp(ip, portsToScan))
    );

    for (const dev of results) {
      if (dev) {
        discoveredDevices.push(dev);
      }
    }

    processedCount += batch.length;
    if (typeof onProgress === 'function') {
      onProgress(processedCount, allIps.length, discoveredDevices.length);
    }
  }

  return {
    scannedCount: allIps.length,
    discoveredDevices
  };
}

module.exports = {
  getLocalSubnets,
  scanSingleIp,
  scanSubnetRange,
  PORT_PROFILES
};
