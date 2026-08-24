using System;
using System.Diagnostics;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AssetManagement.Agent.Collectors;

namespace AssetManagement.Agent.Services
{
    public class ScanService
    {
        private static readonly HttpClient _httpClient = new HttpClient();
        private static string _lastDigestHash = "";
        private const string SecretKey = "AssetManagementAgentSecretKey2026";
        private const string ServerUrl = "http://localhost:5000/api/agent/report";

        public static async Task<bool> RunScanAndReportAsync(bool forceReport = false)
        {
            var stopwatch = Stopwatch.StartNew();
            long initialMemory = GC.GetTotalMemory(true);

            // 1. Gather Telemetry
            var hardware = HardwareCollector.Collect();
            var software = SoftwareCollector.Collect();

            string hostname = Environment.MachineName;
            string domainWorkgroup = Environment.UserDomainName;
            string osName = Environment.OSVersion.ToString() + " (" + (Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit") + ")";
            string agentId = "AGENT-" + hostname.ToUpper();

            // Extract Network & Serial details
            dynamic hw = hardware;
            string ipAddress = hw.nic?.ip ?? "127.0.0.1";
            string macAddress = hw.nic?.mac ?? "00:00:00:00:00:00";
            string serialNumber = hw.serialNumber ?? "N/A";

            var payload = new
            {
                agentId,
                hostname,
                domainWorkgroup,
                osName,
                ipAddress,
                macAddress,
                serialNumber,
                hardware,
                software
            };

            stopwatch.Stop();
            long memoryUsedMb = (GC.GetTotalMemory(false)) / (1024 * 1024);

            Console.WriteLine($"[Agent Telemetry] Scan Completed in {stopwatch.ElapsedMilliseconds} ms. Memory: {memoryUsedMb} MB RAM.");

            // 2. Compute local digest hash
            string jsonPayload = JsonSerializer.Serialize(payload);
            string currentHash = ComputeSha256(jsonPayload);

            if (!forceReport && currentHash == _lastDigestHash)
            {
                Console.WriteLine("[Agent] Telemetry unchanged since last report. Skipping network payload.");
                return true;
            }

            // 3. HMAC-SHA256 Payload Signature
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string signature = ComputeHmacSignature(jsonPayload, timestamp.ToString(), SecretKey);

            // 4. HTTP Send
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, ServerUrl)
                {
                    Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                };

                request.Headers.Add("X-Agent-Signature", signature);
                request.Headers.Add("X-Agent-Timestamp", timestamp.ToString());

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    _lastDigestHash = currentHash;
                    string resText = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[Agent -> Server Success] Response: {resText}");
                    return true;
                }
                else
                {
                    Console.WriteLine($"[Agent -> Server Error] Status: {response.StatusCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Agent Telemetry Warning] Could not reach Server at {ServerUrl}: {ex.Message}");
                return false;
            }
        }

        private static string ComputeSha256(string raw)
        {
            using var sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            return Convert.ToHexString(bytes);
        }

        private static string ComputeHmacSignature(string payload, string timestamp, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            byte[] bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload + "." + timestamp));
            return Convert.ToHexString(bytes).ToLower();
        }
    }
}
