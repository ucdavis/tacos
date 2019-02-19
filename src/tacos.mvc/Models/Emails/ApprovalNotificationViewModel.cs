using System;
using System.Collections.Generic;
using System.Text;
using tacos.core.Data;

namespace tacos.emails.models
{
    public class ApprovalNotificationViewModel
    {
        public string RecipientName { get; set; }

        public IList<Request> Requests { get; set; }
    }
}
