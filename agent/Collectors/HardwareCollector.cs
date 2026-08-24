using System;
using System.Collections.Generic;
using System.IO;
using System.Management;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace AssetManagement.Agent.Collectors
{
    public class HardwareCollector
    {
        public static object Collect()
        {
            var mainboard = GetMainboard();
            var cpu = GetCpu();
            var ram = GetRamInfo();
            var disks = GetDisks();
            var logicalDisks = GetLogicalDisks();
            var gpu = GetGpu();
            var nic = GetNetworkInfo();
            var systemSerial = GetSystemSerial();

            return new
            {
                mainboard,
                cpu,
                ram,
                disks,
                logicalDisks,
                gpu,
                nic,
                serialNumber = systemSerial
            };
        }

        private static List<object> GetLogicalDisks()
        {
            var list = new List<object>();

            try
            {
                foreach (DriveInfo drive in DriveInfo.GetDrives())
                {
                    if (drive.IsReady && (drive.DriveType == DriveType.Fixed || drive.DriveType == DriveType.Removable))
                    {
                        double totalGb = Math.Round((double)drive.TotalSize / (1024 * 1024 * 1024), 1);
                        double freeGb = Math.Round((double)drive.AvailableFreeSpace / (1024 * 1024 * 1024), 1);
                        double usedGb = Math.Round(totalGb - freeGb, 1);
                        double usedPercent = totalGb > 0 ? Math.Round((usedGb / totalGb) * 100, 1) : 0;

                        list.Add(new
                        {
                            driveLetter = drive.Name.Replace("\\", ""),
                            label = string.IsNullOrEmpty(drive.VolumeLabel) ? "System Drive" : drive.VolumeLabel,
                            totalGb,
                            usedGb,
                            freeGb,
                            usedPercent,
                            fileSystem = drive.DriveFormat
                        });
                    }
                }
            }
            catch { }

            return list;
        }

        private static object GetMainboard()
        {
            string manufacturer = "Unknown";
            string model = "Unknown";
            string serial = "Unknown";

            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Manufacturer, Product, SerialNumber FROM Win32_BaseBoard");
                foreach (ManagementObject obj in searcher.Get())
                {
                    manufacturer = obj["Manufacturer"]?.ToString()?.Trim() ?? "Unknown";
                    model = obj["Product"]?.ToString()?.Trim() ?? "Unknown";
                    serial = obj["SerialNumber"]?.ToString()?.Trim() ?? "Unknown";
                    break;
                }
            }
            catch { }

            return new { manufacturer, model, serial };
        }

        private static object GetCpu()
        {
            string name = "Unknown CPU";
            int cores = 1;

            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, NumberOfCores FROM Win32_Processor");
                foreach (ManagementObject obj in searcher.Get())
                {
                    name = obj["Name"]?.ToString()?.Trim() ?? "Unknown CPU";
                    if (obj["NumberOfCores"] != null)
                        cores = Convert.ToInt32(obj["NumberOfCores"]);
                    break;
                }
            }
            catch { }

            return new { name, cores };
        }

        private static object GetRamInfo()
        {
            long totalBytes = 0;
            var slots = new List<object>();

            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Capacity, BankLabel, DeviceLocator, Manufacturer, SerialNumber, Speed FROM Win32_PhysicalMemory");
                foreach (ManagementObject obj in searcher.Get())
                {
                    long capacity = obj["Capacity"] != null ? Convert.ToInt64(obj["Capacity"]) : 0;
                    totalBytes += capacity;

                    int sizeGb = (int)(capacity / (1024 * 1024 * 1024));
                    string slot = obj["DeviceLocator"]?.ToString() ?? obj["BankLabel"]?.ToString() ?? "Slot";
                    string mfr = obj["Manufacturer"]?.ToString()?.Trim() ?? "Generic";
                    string serial = obj["SerialNumber"]?.ToString()?.Trim() ?? "N/A";
                    string speed = obj["Speed"] != null ? $"{obj["Speed"]}MHz" : "N/A";

                    slots.Add(new
                    {
                        slot,
                        sizeGb,
                        manufacturer = mfr,
                        serial,
                        bus = speed
                    });
                }
            }
            catch { }

            int totalGb = (int)(totalBytes / (1024 * 1024 * 1024));
            if (totalGb == 0 && slots.Count > 0) totalGb = 16;

            return new { totalGb, slots };
        }

        private static List<object> GetDisks()
        {
            var list = new List<object>();
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Model, SerialNumber, Size FROM Win32_DiskDrive");
                foreach (ManagementObject obj in searcher.Get())
                {
                    string model = obj["Model"]?.ToString()?.Trim() ?? "Generic Disk";
                    string serial = obj["SerialNumber"]?.ToString()?.Trim() ?? "N/A";
                    long sizeBytes = obj["Size"] != null ? Convert.ToInt64(obj["Size"]) : 0;
                    int sizeGb = (int)(sizeBytes / (1024 * 1024 * 1024));

                    list.Add(new { model, serial, sizeGb });
                }
            }
            catch { }

            return list;
        }

        private static object GetGpu()
        {
            string name = "Integrated Graphics";
            int vramGb = 2;

            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, AdapterRAM FROM Win32_VideoController");
                foreach (ManagementObject obj in searcher.Get())
                {
                    name = obj["Name"]?.ToString()?.Trim() ?? "Graphics Adapter";
                    if (obj["AdapterRAM"] != null)
                    {
                        long ramBytes = Convert.ToInt64(obj["AdapterRAM"]);
                        vramGb = (int)(ramBytes / (1024 * 1024 * 1024));
                        if (vramGb <= 0) vramGb = 4;
                    }
                    break;
                }
            }
            catch { }

            return new { name, vramGb };
        }

        private static object GetNetworkInfo()
        {
            string name = "Ethernet";
            string mac = "00:00:00:00:00:00";
            string ip = "127.0.0.1";

            try
            {
                foreach (var nicInterface in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (nicInterface.OperationalStatus == OperationalStatus.Up &&
                        nicInterface.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                    {
                        name = nicInterface.Name;
                        mac = nicInterface.GetPhysicalAddress().ToString();
                        if (mac.Length == 12)
                        {
                            mac = string.Join(":", System.Text.RegularExpressions.Regex.Matches(mac, ".."));
                        }

                        foreach (var ipInfo in nicInterface.GetIPProperties().UnicastAddresses)
                        {
                            if (ipInfo.Address.AddressFamily == AddressFamily.InterNetwork)
                            {
                                ip = ipInfo.Address.ToString();
                                break;
                            }
                        }

                        if (!string.IsNullOrEmpty(ip) && ip != "127.0.0.1") break;
                    }
                }
            }
            catch { }

            return new { name, mac, ip };
        }

        private static string GetSystemSerial()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BIOS");
                foreach (ManagementObject obj in searcher.Get())
                {
                    string serial = obj["SerialNumber"]?.ToString()?.Trim();
                    if (!string.IsNullOrEmpty(serial) && serial != "To be filled by O.E.M.")
                        return serial;
                }
            }
            catch { }

            return "SN-SYSTEM-" + Environment.MachineName.GetHashCode().ToString("X");
        }
    }
}
