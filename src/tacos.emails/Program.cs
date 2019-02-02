using System;
using System.IO;
using mjml.aspnetcore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RazorLight;
using Serilog;
using tacos.core;
using tacos.emails.models;

namespace tacos.emails
{
    class Program
    {
        static void Main(string[] args)
        {
            Configure();

            var serviceProvider = ConfigureServices();

            var model = new DigestViewModel()
            {
                Message = "Hi John",
            };

            // add model data to email
            var engine = GetRazorEngine();
            var html = engine.CompileRenderAsync("./emails/digest.cshtml", model).GetAwaiter().GetResult();

            // convert email to real html
            var mjmlService = serviceProvider.GetRequiredService<IMjmlServices>();
            html = mjmlService.Render(html).GetAwaiter().GetResult();

            Console.Write(html);
        }

        public static IConfigurationRoot Configuration { get; set; }

        private static void Configure()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json");

            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            if (string.Equals(environmentName, "development", StringComparison.OrdinalIgnoreCase))
            {
                builder.AddUserSecrets<Program>();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            Log.Logger = new LoggerConfiguration()
                .WriteTo.Stackify()
                .CreateLogger();
        }

        private static ServiceProvider ConfigureServices()
        {
            IServiceCollection services = new ServiceCollection();

            //// options files
            //services.Configure<FinanceSettings>(Configuration.GetSection("Finance"));
            //services.Configure<SlothSettings>(Configuration.GetSection("Sloth"));

            // db service
            services.AddDbContext<TacoDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"))
            );

            // required services
            services.AddMjmlServices(o =>
            {
                o.DefaultBeautify = true;
            });

            //// required services
            //services.AddTransient<ISlothService, SlothService>();

            //services.AddSingleton<MoneyMovementJob>();

            return services.BuildServiceProvider();
        }

        private static RazorLightEngine GetRazorEngine()
        {
            var path = Path.GetFullPath(".");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();

            return engine;
        }
    }
}
