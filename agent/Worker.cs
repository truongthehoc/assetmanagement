using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AssetManagement.Agent.Services;

namespace AssetManagement.Agent
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        // Periodic telemetry interval: Continuously scans and updates IP every 10 minutes
        private readonly TimeSpan _scanInterval = TimeSpan.FromMinutes(10);

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AssetManagement.Agent Windows Service started. Initializing periodic IP & telemetry scanner (Cycle: 10 minutes)...");

            // Initial scan on startup
            await ScanService.RunScanAndReportAsync(forceReport: true);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Waiting 10 minutes for next IP & Telemetry scan cycle...");
                    await Task.Delay(_scanInterval, stoppingToken);
                    
                    _logger.LogInformation("Executing scheduled 10-minute IP & hardware status report...");
                    await ScanService.RunScanAndReportAsync(forceReport: true);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Agent 10-minute periodic scan cycle.");
                }
            }

            _logger.LogInformation("AssetManagement.Agent Service stopping.");
        }
    }
}
