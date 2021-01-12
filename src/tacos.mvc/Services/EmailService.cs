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
using tacos.core;
using tacos.core.Data;
using tacos.core.Resources;
using tacos.emails.models;

using Microsoft.Extensions.Hosting;
using System.Net.Mail;
using System.Net;

namespace tacos.mvc.services
{
    public class EmailService : IEmailService
    {
        private readonly bool _isDevelopment;

        private readonly SparkpostSettings _emailSettings;

        private readonly IMjmlServices _mjmlServices;
        private readonly TacoDbContext _dbContext;
        private readonly UserManager<User> _userManager;

        private readonly SmtpClient _client;

        private readonly MailAddress _replyAddress = new MailAddress("tacos-donotreply@notify.ucdavis.edu", "TACOS Notification");
        private readonly MailAddress _ccAddress = new MailAddress("tacos-approval-notice@ucdavis.edu", "TACOS Reviewers");

        public EmailService(IWebHostEnvironment environment, IOptions<SparkpostSettings> emailSettings, IMjmlServices mjmlServices, TacoDbContext dbContext, UserManager<User> userManager)
        {
            _isDevelopment = environment.IsDevelopment();

            _emailSettings = emailSettings.Value;

            _mjmlServices = mjmlServices;
            _dbContext = dbContext;
            _userManager = userManager;

            _client = new SmtpClient(_emailSettings.Host, _emailSettings.Port) { Credentials = new NetworkCredential(_emailSettings.UserName, _emailSettings.Password), EnableSsl = true };
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

            // create message
            using (var message = new MailMessage { From = _replyAddress, Subject = "New Pending Approvals on TACOS" })
            {
                message.Body = result.Html;

                admins.Select(a => GetMailAddressFromUser(a)).ToList().ForEach(message.To.Add);

                // send it
                await _client.SendMailAsync(message);
            }
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

            // create message
            using (var message = new MailMessage { From = _replyAddress, Subject = subject })
            {
                message.Body = result.Html;

                message.To.Add(GetMailAddressFromUser(recipient));
                message.CC.Add(_ccAddress);

                // send it
                await _client.SendMailAsync(message);
            }
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

        private MailAddress GetMailAddressFromUser(User user)
        {
            if (_isDevelopment)
            {
                return new MailAddress("srkirkland@ucdavis.edu");
            }

            return new MailAddress(user.Email, user.Name);
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
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
    }

}
