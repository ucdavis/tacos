using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace tacos.core.Data
{
    public class User : IdentityUser
    {
        [StringLength(50)]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [StringLength(50)]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Required]
        [StringLength(256)]
        [Display(Name = "Name")]
        public string Name { get; set; }

        public IList<DepartmentRole> DepartmentRoles { get; set; }
    }
}
