using System.ComponentModel.DataAnnotations;

namespace tacos.mvc.Models.AccountViewModels
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
