using AspNetCore.Security.CAS;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Helpers;
using tacos.mvc.services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Mjml.AspNetCore;
using MvcReact;
using Serilog;
using Microsoft.Extensions.Hosting;

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

            services.AddViteServices(options =>
            {
                options.SourcePath = ".";
                options.DevServerScheme = "http";
                options.DevServerPort = 5173;
                options.ViteDevServerEntry = "/index.tsx";
            });

            // add render services
            services.AddMjmlServices();

            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IDirectorySearchService, IetWsSearchService>();
            services.AddTransient<IRequestCalculationService, RequestCalculationService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory, IOptions<MvcReactOptions> mvcReactOptions)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseMvcReactStaticFiles();

            app.UseSerilogRequestLogging();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(routes =>
            {
                if (env.IsDevelopment())
                {
                    routes.MapControllerRoute(
                        name: "default",
                        pattern: "{controller=Home}/{action=Index}/{id?}",
                        constraints: new { controller = mvcReactOptions.Value.ExcludeHmrPathsRegex }
                    );
                }
                else
                {
                    routes.MapDefaultControllerRoute();
                }
            });

            app.UseMvcReact();
        }
    }
}
