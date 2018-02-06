using System;
using AspNetCore.Security.CAS;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using tacos.data;
using tacos.mvc.services;

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
            services.Configure<CommonSettings>(Configuration.GetSection("Common"));

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

            services.AddMvc();

            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<IDirectorySearchService, IetWsSearchService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
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
