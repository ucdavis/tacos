using tacos.data;
using tacos.mvc.Models;

namespace tacos.mvc.Models
{
    public class RequestModel
    {
        public Course Course { get; set; }

        public string CourseType { get; set; }

        public string RequestType { get; set; }

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTotal { get; set; }

        public double ExceptionAnnualizedTotal { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }

        public double AnnualizedTotal { get; set; }
    }
}