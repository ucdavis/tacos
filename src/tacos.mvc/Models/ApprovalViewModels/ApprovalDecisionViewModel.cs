using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace tacos.mvc.Models.ApprovalViewModels
{
    public class ApprovalDecisionViewModel
    {
        public bool Approved { get; set; }

        public string Comment { get; set; }
    }
}
