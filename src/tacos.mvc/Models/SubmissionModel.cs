using System.Collections.Generic;

namespace tacos.mvc.Models
{
    public class SubmissionModel {
        public string Department { get; set; }
        public ICollection<RequestModel> Requests { get; set; }
        
    }
}