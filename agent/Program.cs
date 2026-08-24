using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AssetManagement.Agent.Services;

namespace AssetManagement.Agent
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            if (args.Length > 0 && args[0].Equals("--scan-now", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("Executing immediate one-time hardware & software telemetry scan...");
                await ScanService.RunScanAndReportAsync(forceReport: true);
                return;
            }

            var builder = Host.CreateDefaultBuilder(args)
                .UseWindowsService()
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddHostedService<Worker>();
                });

            var host = builder.Build();
            await host.RunAsync();
        }
    }
}
