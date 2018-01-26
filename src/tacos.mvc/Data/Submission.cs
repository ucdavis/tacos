using System;
using System.Collections.Generic;


namespace tacos.data
{
    // submission with several requests associated
    public class Submission {
        public Submission()
        {
            Created = DateTime.UtcNow;
            Requests = new List<Request>();
        }
        public int Id { get; set; }

        public string Actor { get; set; }

        public DateTime Created { get; set; }

        public ICollection<Request> Requests { get; set; }
    }
        
}
