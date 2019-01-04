using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using tacos.data;

namespace tacos.mvc.Data
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        [JsonIgnore]
        public IList<Request> Requests { get; set; }

        [JsonIgnore]
        public IList<DepartmentRole> MemberRoles { get; set; }
    }
}
