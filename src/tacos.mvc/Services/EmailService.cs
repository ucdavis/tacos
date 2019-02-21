using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Mjml.AspNetCore;
using Microsoft.Extensions.Options;
using RazorLight;
using SparkPost;
using tacos.core;
using tacos.core.Data;
using tacos.emails.models;

using Request = tacos.core.Data.Request;

namespace tacos.mvc.services
{
    public class EmailService : IEmailService
    {
        private readonly SparkpostSettings _emailSettings;

        private readonly IMjmlServices _mjmlServices;
        private readonly TacoDbContext _dbContext;

        private readonly Address _replyAddress = new Address("tacos-donotreply@notify.ucdavis.edu", "TACOS Notification");

        public EmailService(IOptions<SparkpostSettings> emailSettings, IMjmlServices mjmlServices, TacoDbContext dbContext)
        {
            _emailSettings = emailSettings.Value;

            _mjmlServices = mjmlServices;
            _dbContext = dbContext;
        }

        public async Task SendSubmissionNotification(IReadOnlyList<Request> requests)
        {
            if (!requests.Any())
            {
                return;
            }

            // get approvers, specifically, penny
            var pennyUser = await _dbContext.Users.FindAsync("ph8335");

            var model = new SubmissionNotificationViewModel()
            {
                RecipientName = pennyUser.Name,
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
                Recipients = new List<Recipient>()
                {
                    new Recipient() {Address = GetAddressFromUser(pennyUser)},
                },
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
#if DEBUG
            return new Address("jpknoll@ucdavis.edu");
#else
            return new Address(user.Email, user.Name);
#endif
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
