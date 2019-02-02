using System.Collections.Generic;
using tacos.core.Data;

namespace tacos.mvc.Models.SystemViewModels
{
    public class UserRolesViewModel
    {
        public IList<SystemRoleViewModel> SystemRoles { get; set; }

        public IList<DepartmentRole> DepartmentRoles { get; set; }
    }

    public class SystemRoleViewModel
    {
        public User User { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsReviewer { get; set; }
    }
}
