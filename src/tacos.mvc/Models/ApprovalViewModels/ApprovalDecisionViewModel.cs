using System;

namespace tacos.mvc.Models.ApprovalViewModels
{
    public class ApprovalDecisionViewModel
    {
        public bool Approved { get; set; }

        public string Comment { get; set; }

        public string CommentOther { get; set; }
    }
}
