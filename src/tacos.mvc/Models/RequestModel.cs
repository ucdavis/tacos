
namespace tacos.mvc.Models
{
    public class RequestModel
    {
        public int Id { get; set; }

        public string CourseName { get; set; }

        public string CourseNumber { get; set; }

        public string CourseType { get; set; }

        public string RequestType { get; set; }

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTotal { get; set; }

        public double ExceptionTaTotal { get; set; }

        public double ExceptionReaderTotal { get; set; }

        public double ExceptionAnnualCount { get; set; }

        public double ExceptionAnnualizedTotal { get; set; }

        public double ExceptionAnnualizedTaTotal { get; set; }

        public double ExceptionAnnualizedReaderTotal { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }

        public double CalculatedTaTotal { get; set; }

        public double CalculatedReaderTotal { get; set; }

        public double AnnualizedTotal { get; set; }

        public double AnnualizedTaTotal { get; set; }

        public double AnnualizedReaderTotal { get; set; }

        public bool IsDeleted { get; set; }

        public bool IsDirty { get; set; }
    }
}
