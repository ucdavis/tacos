using System.ComponentModel.DataAnnotations;

namespace tacos.mvc.Models.AccountViewModels
{
    public class ExternalLoginViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Name { get; set; }
    }
}
