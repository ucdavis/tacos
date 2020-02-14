using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Mjml.AspNetCore;
using Microsoft.Extensions.Options;
using RazorLight;
using SparkPost;
using tacos.core;
using tacos.core.Data;
using tacos.core.Resources;
using tacos.emails.models;

using Request = tacos.core.Data.Request;

namespace tacos.mvc.services
{
    public class EmailService : IEmailService
    {
        private readonly bool _isDevelopment;

        private readonly SparkpostSettings _emailSettings;

        private readonly IMjmlServices _mjmlServices;
        private readonly TacoDbContext _dbContext;
        private readonly UserManager<User> _userManager;

        private readonly Address _replyAddress = new Address("tacos-donotreply@notify.ucdavis.edu", "TACOS Notification");
        private readonly Address _ccAddress = new Address("tacos-approval-notice@ucdavis.edu", "TACOS Reviewers");

        public EmailService(IHostingEnvironment environment, IOptions<SparkpostSettings> emailSettings, IMjmlServices mjmlServices, TacoDbContext dbContext, UserManager<User> userManager)
        {
            _isDevelopment = environment.IsDevelopment();

            _emailSettings = emailSettings.Value;

            _mjmlServices = mjmlServices;
            _dbContext = dbContext;
            _userManager = userManager;
        }

        public async Task SendSubmissionNotification(IReadOnlyList<Request> requests)
        {
            if (!requests.Any())
            {
                return;
            }

            // get approvers
            var admins = await _userManager.GetUsersInRoleAsync(RoleCodes.Admin);

            var model = new SubmissionNotificationViewModel()
            {
                RecipientName = "Penny",
                Requests = requests.ToList(),
            };

            // add model data to email
            var engine = GetRazorEngine();
            var prehtml = await engine.CompileRenderAsync("SubmissionNotification.cshtml", model);

            // convert email to real html
            var result = await _mjmlServices.Render(prehtml);

            // create transmission
            
            var transmission = new Transmission()
            {
                Content = new Content()
                {
                    Subject = "New Pending Approvals on TACOS",
                    Html = result.Html,
                    From = _replyAddress,
                },
                Recipients = new List<Recipient>(admins.Select(a => new Recipient() { Address = GetAddressFromUser(a) })),
            };

            var client = GetSparkpostClient();
            await client.Transmissions.Send(transmission);
        }

        public async Task SendApprovalNotification(Request request)
        {
            if (!request.Approved.HasValue)
            {
                throw new ArgumentException("Request.Approved must have a value.", nameof(request.Approved));
            }

            // get submitter
            var recipient = await _dbContext.Users.FindAsync(request.SubmittedBy);

            var model = new ApprovalNotificationViewModel()
            {
                RecipientName = recipient.Name,
                Request = request,
            };

            // add model data to email
            var engine = GetRazorEngine();
            var prehtml = await engine.CompileRenderAsync("ApprovalNotification.cshtml", model);

            // convert email to real html
            var result = await _mjmlServices.Render(prehtml);

            // create decision subject
            var subject = request.Approved.Value
                ? $"TACOS Request Approved for {request.CourseNumber}"
                : $"TACOS Request Denied for {request.CourseNumber}";

            // create transmission
            var transmission = new Transmission()
            {
                Content = new Content()
                {
                    Subject = subject,
                    Html = result.Html,
                    From = _replyAddress,
                },
                Recipients = new List<Recipient>()
                {
                    new Recipient() {Address = GetAddressFromUser(recipient)},
                    new Recipient { Address = _ccAddress, Type = RecipientType.CC }
                },
            };

            var client = GetSparkpostClient();
            await client.Transmissions.Send(transmission);
        }

        private static RazorLightEngine GetRazorEngine()
        {
            var path = Path.GetFullPath("./Emails");

            var engine = new RazorLightEngineBuilder()
                .UseFilesystemProject(path)
                .UseMemoryCachingProvider()
                .Build();

            return engine;
        }

        private Client GetSparkpostClient()
        {
            var client = new Client(_emailSettings.ApiKey);
            return client;
        }

        private Address GetAddressFromUser(User user)
        {
            if (_isDevelopment)
            {
                return new Address("jpknoll@ucdavis.edu");
            }

            return new Address(user.Email, user.Name);
        }
    }

    public interface IEmailService
    {
        Task SendSubmissionNotification(IReadOnlyList<Request> requests);

        Task SendApprovalNotification(Request request);
    }

    public class SparkpostSettings
    {
        public string ApiKey { get; set; }
    }

}
