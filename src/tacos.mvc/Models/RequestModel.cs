using tacos.mvc.Models;

namespace tacos.mvc.Models
{
    public class RequestModel {
        public Course Course { get; set; }

        public string CourseType { get; set; }

        public string RequestType { get; set; }

        public bool Contested { get; set; }

        public string ContestReason { get; set; }

        public double ContestTotal { get; internal set; }
        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }
    }
}