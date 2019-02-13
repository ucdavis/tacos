using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tacos.mvc.Data;

namespace tacos.mvc.Models.SystemViewModels
{
    public class DepartmentRolesViewModel
    {
        public IList<DepartmentRole> DepartmentRoles { get; set; }
    }
}
