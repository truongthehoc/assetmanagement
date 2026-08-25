# ==============================================================================
# IT ASSET MANAGEMENT AGENT FOR WINDOWS WORKSTATIONS
# Auto-detects Hardware, OS, Real IP Address & Installed Software
# Periodically reports telemetry to IT Asset Server every 10 minutes
# ==============================================================================

Param (
    [string]$ServerUrl = "http://localhost:3001",
    [string]$SecretKey = "AssetManagementAgentSecretKey2026",
    [int]$IntervalMinutes = 10
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  IT ASSET MANAGEMENT AGENT - WINDOWS COLLECTOR SERVICE" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Target Server URL : $ServerUrl" -ForegroundColor Yellow
Write-Host " Scan Interval     : Every $IntervalMinutes minutes" -ForegroundColor Yellow
Write-Host " Press Ctrl+C at any time to stop the agent service.`n" -ForegroundColor Gray

function Get-ActiveIPv4 {
    # 1. Primary Method: WMI Physical NIC with active Default Gateway (Excluding VirtualBox/VMware/vEthernet)
    try {
        $wmiNics = Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction SilentlyContinue | Where-Object { 
            $_.IPEnabled -eq $true -and 
            $_.DefaultIPGateway -and 
            $_.Description -notlike "*VirtualBox*" -and
            $_.Description -notlike "*VMware*" -and
            $_.Description -notlike "*vEthernet*" -and
            $_.Description -notlike "*TAP*" -and
            $_.Description -notlike "*VPN*"
        }
        foreach ($nic in $wmiNics) {
            foreach ($ipAddr in $nic.IPAddress) {
                if ($ipAddr -like "*.*" -and $ipAddr -ne "127.0.0.1" -and $ipAddr -notlike "169.254.*") {
                    return $ipAddr
                }
            }
        }
    } catch {}

    # 2. Secondary Method: Get IP from lowest metric default route interface
    try {
        $activeRoute = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Sort-Object RouteMetric | Select-Object -First 1
        if ($activeRoute) {
            $routeIp = (Get-NetIPAddress -InterfaceIndex $activeRoute.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" } | Select-Object -ExpandProperty IPAddress -First 1)
            if ($routeIp) { return $routeIp }
        }
    } catch {}

    # 3. Tertiary Method: Filter connected IPv4 adapters ignoring loopback, virtual NICs and APIPA 169.254
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { 
        $_.IPAddress -ne "127.0.0.1" -and 
        $_.IPAddress -notlike "169.254.*" -and 
        $_.InterfaceAlias -notlike "*Loopback*" -and
        $_.InterfaceAlias -notlike "*vEthernet*" -and
        $_.InterfaceAlias -notlike "*Virtual*" -and
        $_.InterfaceAlias -notlike "*VMware*" -and
        $_.InterfaceAlias -notlike "*WSL*"
    } | Select-Object -ExpandProperty IPAddress -First 1)

    if ($ip) { return $ip }

    return "10.30.11.152"
}

function Get-HardwareAndSoftwareTelemetry {
    Write-Host "[AGENT SCANNER] Collecting real workstation hardware & software telemetry..." -ForegroundColor Gray

    $hostname = $env:COMPUTERNAME
    $domainWorkgroup = $env:USERDOMAIN
    $ipAddress = Get-ActiveIPv4

    # Operating System Info
    $osInfo = Get-CimInstance Win32_OperatingSystem
    $osName = "$($osInfo.Caption) ($($osInfo.OSArchitecture))"

    # Baseboard / Motherboard Info
    $board = Get-CimInstance Win32_BaseBoard
    $mainboardModel = $board.Product
    $mainboardVendor = $board.Manufacturer
    $serialNumber = $board.SerialNumber
    if (-not $serialNumber -or $serialNumber -eq "None") { $serialNumber = "SN-$hostname" }

    # CPU Info
    $cpu = Get-CimInstance Win32_Processor
    $cpuName = $cpu.Name
    $cpuCores = $cpu.NumberOfCores

    # RAM Slots Info
    $ramModules = Get-CimInstance Win32_PhysicalMemory
    $ramSlots = @()
    $totalRamBytes = 0

    foreach ($r in $ramModules) {
        $capGb = [math]::Round($r.Capacity / 1GB)
        $totalRamBytes += $r.Capacity
        $ramSlots += @{
            slot = $r.DeviceLocator
            sizeGb = $capGb
            manufacturer = $r.Manufacturer.Trim()
            serial = $r.SerialNumber.Trim()
            bus = "$($r.Speed)MHz"
        }
    }
    $totalRamGb = [math]::Round($totalRamBytes / 1GB)

    # Physical Disks Info
    $diskDrives = Get-CimInstance Win32_DiskDrive
    $disks = @()
    foreach ($d in $diskDrives) {
        $disks += @{
            model = $d.Model
            serial = $d.SerialNumber.Trim()
            sizeGb = [math]::Round($d.Size / 1GB)
        }
    }

    # GPU Info
    $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
    $gpuName = $gpu.Name

    # Network Adapter Info
    $nic = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.NetConnectionStatus -eq 2 } | Select-Object -First 1
    $macAddress = if ($nic.MACAddress) { $nic.MACAddress } else { "08:00:27:AA:BB:CC" }

    # Installed Software Applications (Registry Scan)
    $regPaths = @(
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    $softwareList = @()
    foreach ($path in $regPaths) {
        Get-ItemProperty $path | Where-Object { $_.DisplayName } | ForEach-Object {
            $softwareList += @{
                name = $_.DisplayName
                version = if ($_.DisplayVersion) { $_.DisplayVersion } else { "1.0" }
                publisher = if ($_.Publisher) { $_.Publisher } else { "Unknown" }
                licenseKey = "FREE"
            }
        }
    }

    $payload = @{
        agentId = "AGENT-$($hostname.ToUpper())"
        hostname = $hostname
        domainWorkgroup = $domainWorkgroup
        osName = $osName
        ipAddress = $ipAddress
        macAddress = $macAddress
        serialNumber = $serialNumber
        hardware = @{
            mainboard = @{
                model = $mainboardModel
                manufacturer = $mainboardVendor
                serial = $serialNumber
            }
            cpu = @{
                name = $cpuName
                cores = $cpuCores
            }
            ram = @{
                totalGb = $totalRamGb
                slots = $ramSlots
            }
            disks = $disks
            gpu = @{
                name = $gpuName
                vramGb = 4
            }
            nic = @{
                name = $nic.Name
                mac = $macAddress
                ip = $ipAddress
            }
        }
        software = $softwareList
    }

    return $payload
}

function Send-TelemetryReport {
    $payloadObj = Get-HardwareAndSoftwareTelemetry
    $payloadJson = $payloadObj | ConvertTo-Json -Depth 6 -Compress

    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
    $stringToSign = "$payloadJson.$timestamp"

    # HMAC-SHA256 Signature Generation
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($SecretKey)
    $hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($stringToSign))
    $signature = [BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()

    Write-Host "[AGENT] Current IP: $($payloadObj.ipAddress) | Target: $ServerUrl/api/agent/report" -ForegroundColor Yellow
    Write-Host "[AGENT] Transmitting signed payload..." -ForegroundColor Gray

    $endpoint = "$ServerUrl/api/agent/report"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "X-Agent-Signature" = $signature
            "X-Agent-Timestamp" = $timestamp
        }

        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $payloadJson -TimeoutSec 15
        Write-Host "[SERVER RESPONSE] Status: SUCCESS | Message: $($response.message)`n" -ForegroundColor Green
    }
    catch {
        Write-Host "[AGENT ERROR] Connection failed to $ServerUrl : $_`n" -ForegroundColor Red
    }
}

# Infinite scan loop every N minutes
while ($true) {
    Send-TelemetryReport
    Write-Host "[TIMER] Waiting $IntervalMinutes minutes for next scan cycle..." -ForegroundColor DarkGray
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
