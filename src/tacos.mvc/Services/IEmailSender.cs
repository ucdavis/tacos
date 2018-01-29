using System.Threading.Tasks;

namespace tacos.mvc.services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
    }
}
