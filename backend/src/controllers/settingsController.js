const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const settingsFilePath = path.join(__dirname, '../config/settings.json');

const defaultSettings = {
  orgInfo: {
    name: 'Công Ty Cổ Phần Bệnh Viện Thuận Mỹ TDM',
    phone: '02743835117',
    address: 'Số 152 Huỳnh Văn Cù, P. Hiệp Thành, TP. Thủ Dầu Một, Tỉnh Bình Dương',
    taxCode: '3701604767',
    logoUrl: '/docs/logo.png',
    faviconUrl: '/docs/favicon.ico'
  },
  systemInfo: {
    softwareName: 'IT AssetGuard Enterprise System',
    developer: 'Google DeepMind Team & Advanced Agentic Engineering',
    version: 'v2.5.0-Enterprise (Build 2026.08)',
    licenseType: 'Bản Quyền Doanh Nghiệp (Enterprise License - Unlimited Nodes)',
    releaseDate: '24/08/2026'
  },
  config: {
    telemetryInterval: '30',
    enableDriftAlert: true,
    networkSubnet: '192.168.1.0/24',
    autoScanNewDevices: true
  }
};

// Helper to read settings from JSON file
function readSettingsFromFile() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return defaultSettings;
}

// Helper to write settings to JSON file
function writeSettingsToFile(settings) {
  try {
    const configDir = path.dirname(settingsFilePath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

// GET /api/settings
async function getSettings(req, res) {
  try {
    let settings = readSettingsFromFile();
    
    // Try reading from MySQL if DB is active
    try {
      const rows = await db.query('SELECT setting_key, setting_value FROM system_settings');
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          try {
            settings[r.setting_key] = JSON.parse(r.setting_value);
          } catch {}
        });
      }
    } catch (dbErr) {
      // Fallback to file settings if table doesn't exist yet
    }

    return res.json(settings);
  } catch (err) {
    console.error('getSettings Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/settings
async function saveSettings(req, res) {
  try {
    const { orgInfo, systemInfo, config } = req.body;
    const currentSettings = readSettingsFromFile();

    const newSettings = {
      orgInfo: orgInfo || currentSettings.orgInfo,
      systemInfo: systemInfo || currentSettings.systemInfo,
      config: config || currentSettings.config
    };

    // Save to persistent file
    writeSettingsToFile(newSettings);

    // Save to DB if table exists
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS system_settings (
          setting_key VARCHAR(50) PRIMARY KEY,
          setting_value LONGTEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);

      await db.query('REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)', ['orgInfo', JSON.stringify(newSettings.orgInfo)]);
      await db.query('REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)', ['systemInfo', JSON.stringify(newSettings.systemInfo)]);
      await db.query('REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)', ['config', JSON.stringify(newSettings.config)]);
    } catch (dbErr) {
      console.warn('DB settings sync warning:', dbErr.message);
    }

    return res.json({
      status: 'success',
      message: 'Cài đặt hệ thống & thông tin đơn vị đã được lưu trên Server thành công.',
      settings: newSettings
    });
  } catch (err) {
    console.error('saveSettings Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getSettings,
  saveSettings
};
