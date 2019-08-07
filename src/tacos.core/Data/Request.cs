using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace tacos.core.Data
{
    // request for a specific course
    public class Request
    {
        public Request()
        {
            IsActive = true;
            UpdatedOn = DateTime.UtcNow;
            History = new List<RequestHistory>();
        }

        [Key]
        public int Id { get; set; }

        public bool IsActive { get; set; }

        public DateTime UpdatedOn { get; set; }

        public string UpdatedBy { get; set; }

        [Required]
        public Department Department { get; set; }

        public int DepartmentId { get; set; }

        [Required]
        public Course Course { get; set; }

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

        public string ApprovedComment { get; set; }

        public bool Submitted { get; set; }

        public DateTime? SubmittedOn { get; set; }

        public string SubmittedBy { get; set; }

        public IList<RequestHistory> History { get; set; }

        public static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Request>()
                .HasOne(r => r.Course)
                .WithMany()
                .HasForeignKey(r => r.CourseNumber);
        }

        public bool HasApprovedException {
            get {
                return Exception && Approved.HasValue && Approved.Value;
            }
        }

        public Request ShallowCopy() {
            return (Request) this.MemberwiseClone();
        }
    }
}
