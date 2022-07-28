using AspNetCore.Security.CAS;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Helpers;
using tacos.mvc.services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Mjml.AspNetCore;
using Serilog;
using Microsoft.Extensions.Hosting;
using SpaCliMiddleware;
using Microsoft.AspNetCore.SpaServices;

namespace tacos.mvc
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

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


            // TODO: controllers or controllers with views?
            services.AddControllersWithViews().AddNewtonsoftJson(o =>
            {
                o.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                o.SerializerSettings.Formatting = Formatting.Indented;
                o.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                o.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });

            // add render services
            services.AddMjmlServices();

            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IDirectorySearchService, IetWsSearchService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseSerilogRequestLogging();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(routes => {
                routes.MapDefaultControllerRoute();

                if (env.IsDevelopment())
                {
                    routes.MapToSpaCliProxy(
                        "{*path}",
                        new SpaOptions { SourcePath = "wwwroot/dist" },
                        npmScript: "devpack",
                        port: default(int), // Allow webpack to find own port
                        regex: "Project is running",
                        forceKill: true, // kill anything running on our webpack port
                        useProxy: true // proxy webpack requests back through our aspnet server
                    );
                }
            });
            
        }
    }
}
