using System;
using AspNetCore.Security.CAS;
using Mjml.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Serilog;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Helpers;
using tacos.mvc.services;

namespace tacos.mvc
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsDevelopment())
            {
                builder.AddUserSecrets<Startup>();
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
            Environment = env;
        }

        public IConfigurationRoot Configuration { get; }

        public IHostingEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // add settings
            services.Configure<CommonSettings>(Configuration.GetSection("Common"));
            services.Configure<SparkpostSettings>(Configuration.GetSection("Sparkpost"));

            // setup entity framework
            services.AddDbContextPool<TacoDbContext>(o => 
                o.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentity<User, IdentityRole>()
                            .AddEntityFrameworkStores<TacoDbContext>()
                            .AddDefaultTokenProviders();
            
            services.AddAuthentication(CasDefaults.AuthenticationScheme)
                .AddCAS(options => {
                    options.CasServerUrlBase = Configuration["Common:CasBaseUrl"];
                });

            services.AddMvc().AddJsonOptions(o =>
            {
                o.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                o.SerializerSettings.Formatting = Formatting.Indented;
                o.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                o.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });

            // add render services
            services.AddMjmlServices(o =>
            {
                o.DefaultBeautify = true;
            });

            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IDirectorySearchService, IetWsSearchService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            // setup logging
            LogHelper.Setup(Configuration);
            app.UseMiddleware<StackifyMiddleware.RequestTracerMiddleware>();
            loggerFactory.AddSerilog();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    // HotModuleReplacement = true,
                    // ReactHotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
