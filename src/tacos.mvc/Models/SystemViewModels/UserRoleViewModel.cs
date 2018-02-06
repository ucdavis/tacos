using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tacos.data;

namespace tacos.mvc.Models.SystemViewModels
{
    public class UserRoleViewModel
    {
        public User User { get; set; }
        public bool IsAdmin { get; set; }
    }
}
