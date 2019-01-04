using System.Collections.Generic;

namespace tacos.mvc.Models
{
    public class SubmissionModel
    {
        public int DepartmentId { get; set; }

        public ICollection<RequestModel> Requests { get; set; }
    }
}