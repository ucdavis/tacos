using System.Collections.Generic;

namespace tacos.mvc.Models
{
    public class SubmissionModel {
        public ICollection<RequestModel> Requests { get; set; }
        
    }
}