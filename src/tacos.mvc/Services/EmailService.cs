using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Mjml.AspNetCore;
using Microsoft.Extensions.Options;
using RazorLight;
using SparkPost;
using tacos.emails.models;

using Request = tacos.core.Data.Request;

namespace tacos.mvc.services
{
    public class EmailService : IEmailService
    {
        private readonly SparkpostSettings _emailSettings;

        private readonly IMjmlServices _mjmlServices;

        public EmailService(IOptions<SparkpostSettings> emailSettings, IMjmlServices mjmlServices)
        {
            _emailSettings = emailSettings.Value;

            _mjmlServices = mjmlServices;
        }

        public async Task SendSubmissionNotification(IEnumerable<Request> requests)
        {
            var model = new ApprovalNotificationViewModel()
            {
                Requests = requests.ToList(),
            };

            // add model data to email
            var engine = GetRazorEngine();
            var prehtml = await engine.CompileRenderAsync("./Emails/ApprovalNotification.cshtml", model);

            // convert email to real html
            var result = await _mjmlServices.Render(prehtml);

            // create transmission
            var transmission = new Transmission()
            {
                Content = new Content()
                {
                    Subject = "New Pending Approvals on TACOS",
                    Html = result.Html,
                    From = new Address("donotreply@peaks-notify.ucdavis.edu"),
                },
                Recipients = new List<Recipient>()
                {
                    new Recipient() {Address = new Address("jpknoll@ucdavis.edu")},
                },
            };

            var client = GetSparkpostClient();
            await client.Transmissions.Send(transmission);
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

        private Client GetSparkpostClient()
        {
            var client = new Client(_emailSettings.ApiKey);
            return client;
        }
    }

    public interface IEmailService
    {
        Task SendSubmissionNotification(IEnumerable<Request> requests);
    }

    public class SparkpostSettings
    {
        public string ApiKey { get; set; }
    }

}
