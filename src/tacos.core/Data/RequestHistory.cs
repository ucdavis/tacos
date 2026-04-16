using System;
using System.ComponentModel.DataAnnotations;

namespace tacos.core.Data
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

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTaTotal { get; set; }

        public double ExceptionReaderTotal { get; set; }

        public double ExceptionAnnualCount { get; set; }

        public double ExceptionAnnualizedTaTotal { get; set; }

        public double ExceptionAnnualizedReaderTotal { get; set; }

        public string ApprovedComment { get; set; }

        public double CalculatedTaTotal { get; set; }

        public double CalculatedReaderTotal { get; set; }

        public double AnnualizedTaTotal { get; set; }

        public double AnnualizedReaderTotal { get; set; }

        public bool? Approved { get; set; }

        public double ExceptionTotal => ExceptionTaTotal + ExceptionReaderTotal;

        public double ExceptionAnnualizedTotal => ExceptionAnnualizedTaTotal + ExceptionAnnualizedReaderTotal;

        public double CalculatedTotal => CalculatedTaTotal + CalculatedReaderTotal;

        public double AnnualizedTotal => AnnualizedTaTotal + AnnualizedReaderTotal;

        public double AverageSectionsPerCourse { get; set; }

        public double AverageEnrollment { get; set; }

        public double TimesOfferedPerYear { get; set; }
    }
}
