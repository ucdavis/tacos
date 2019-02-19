using System;
using System.Collections.Generic;
using System.Text;
using tacos.core.Data;

namespace tacos.emails.models
{
    public class ApprovalNotificationViewModel
    {
        public string RecipientName { get; set; }

        public Request Request { get; set; }
    }
}
