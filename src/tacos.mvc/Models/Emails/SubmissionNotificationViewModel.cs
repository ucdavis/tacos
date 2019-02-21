using System;
using System.Collections.Generic;
using tacos.core.Data;

namespace tacos.emails.models
{
    public class SubmissionNotificationViewModel
    {
        public string RecipientName { get; set; }

        public IList<Request> Requests { get; set; }
    }
}
