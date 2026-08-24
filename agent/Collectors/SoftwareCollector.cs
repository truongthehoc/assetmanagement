using System;
using System.Collections.Generic;
using Microsoft.Win32;

namespace AssetManagement.Agent.Collectors
{
    public class SoftwareCollector
    {
        public static List<object> Collect()
        {
            var softwareList = new List<object>();
            var seenNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var registryKeys = new[]
            {
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                @"SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
            };

            // Scan Local Machine (64-bit and 32-bit)
            foreach (var keyPath in registryKeys)
            {
                using var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64);
                using var subKey = baseKey.OpenSubKey(keyPath);
                if (subKey != null)
                {
                    ScanSubKeys(subKey, softwareList, seenNames);
                }
            }

            // Scan Current User (Per-user installed software)
            try
            {
                using var hkcuKey = RegistryKey.OpenBaseKey(RegistryHive.CurrentUser, RegistryView.Registry64);
                using var hkcuSubKey = hkcuKey.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall");
                if (hkcuSubKey != null)
                {
                    ScanSubKeys(hkcuSubKey, softwareList, seenNames);
                }
            }
            catch { }

            return softwareList;
        }

        private static void ScanSubKeys(RegistryKey root, List<object> softwareList, HashSet<string> seenNames)
        {
            foreach (var subKeyName in root.GetSubKeyNames())
            {
                try
                {
                    using var subKey = root.OpenSubKey(subKeyName);
                    if (subKey == null) continue;

                    string displayName = subKey.GetValue("DisplayName")?.ToString()?.Trim();
                    if (string.IsNullOrEmpty(displayName)) continue;

                    // Exclude Windows System components and updates
                    int systemComponent = Convert.ToInt32(subKey.GetValue("SystemComponent") ?? 0);
                    string parentKey = subKey.GetValue("ParentKeyName")?.ToString();
                    if (systemComponent == 1 || !string.IsNullOrEmpty(parentKey)) continue;

                    if (!seenNames.Add(displayName)) continue;

                    string version = subKey.GetValue("DisplayVersion")?.ToString()?.Trim() ?? "1.0";
                    string publisher = subKey.GetValue("Publisher")?.ToString()?.Trim() ?? "Unknown";

                    softwareList.Add(new
                    {
                        name = displayName,
                        version,
                        publisher,
                        licenseKey = "REGISTERED"
                    });
                }
                catch { }
            }
        }
    }
}
