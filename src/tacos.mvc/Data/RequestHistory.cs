using System;
using System.ComponentModel.DataAnnotations;
using tacos.data;

namespace tacos.mvc.Data
{
    public class RequestHistory
    {
        public RequestHistory()
        {
        }

        [Key]
        public int Id { get; set; }

        public Department Department { get; set; }

        public int DepartmentId { get; set; }

        public Request Request { get; set; }

        public int RequestId { get; set; }

        public DateTime UpdatedOn { get; set; }

        public string UpdatedBy { get; set; }

        public string CourseNumber { get; set; }

        public string CourseType { get; set; }

        public string RequestType { get; set; }

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTotal { get; set; }

        public double ExceptionAnnualizedTotal { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }

        public double AnnualizedTotal { get; set; }

        public bool? Approved { get; set; }

        public double AverageSectionsPerCourse { get; set; }

        public double AverageEnrollment { get; set; }

        public double TimesOfferedPerYear { get; set; }
    }
}
