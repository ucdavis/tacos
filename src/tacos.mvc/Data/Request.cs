using System;
using System.ComponentModel.DataAnnotations;
using tacos.mvc.Data;

namespace tacos.data
{
    // request for a specific course
    public class Request
    {
        public Request()
        {
            UpdatedOn = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public DateTime UpdatedOn { get; set; }

        public string UpdatedBy { get; set; }

        [Required]
        public Department Department { get; set; }

        public int DepartmentId { get; set; }

        public string CourseNumber { get; set; }

        public string CourseType { get; set; }

        public string RequestType { get; set; }

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTotal { get; set; }

        public double ExceptionAnnualizedTotal { get; set; }

        public double AverageSectionsPerCourse { get; set; }

        public double AverageEnrollment { get; set; }

        public double TimesOfferedPerYear { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }

        public double AnnualizedTotal { get; set; }
        
        public bool? Approved { get; set; }        

        public double ApprovedTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                // if we've made a decision
                if (Approved.Value) {
                    return Exception ? ExceptionTotal : CalculatedTotal;
                }

                return CalculatedTotal;
            }
        }

        public double ApprovedAnnualizedTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                // if we've made a decision
                if (Approved.Value)
                {
                    return Exception ? ExceptionAnnualizedTotal : AnnualizedTotal;
                }

                return AnnualizedTotal;
            }
        }
    }
}
