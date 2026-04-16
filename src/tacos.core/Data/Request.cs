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

        public bool Exception { get; set; }

        public string ExceptionReason { get; set; }

        public double ExceptionTaTotal { get; set; }

        public double ExceptionReaderTotal { get; set; }

        public double ExceptionAnnualCount { get; set; }

        public double ExceptionAnnualizedTaTotal { get; set; }

        public double ExceptionAnnualizedReaderTotal { get; set; }

        public double CalculatedTaTotal { get; set; }

        public double CalculatedReaderTotal { get; set; }

        public double AnnualizedTaTotal { get; set; }

        public double AnnualizedReaderTotal { get; set; }
        
        public bool? Approved { get; set; }        

        public double ApprovedTaTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                if (Approved.Value)
                {
                    return Exception ? ExceptionTaTotal : CalculatedTaTotal;
                }

                return CalculatedTaTotal;
            }
        }

        public double ApprovedReaderTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                if (Approved.Value)
                {
                    return Exception ? ExceptionReaderTotal : CalculatedReaderTotal;
                }

                return CalculatedReaderTotal;
            }
        }

        public double ApprovedAnnualizedTaTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                if (Approved.Value)
                {
                    return Exception ? ExceptionAnnualizedTaTotal : AnnualizedTaTotal;
                }

                return AnnualizedTaTotal;
            }
        }

        public double ApprovedAnnualizedReaderTotal
        {
            get
            {
                if (!Approved.HasValue) return 0;

                if (Approved.Value)
                {
                    return Exception ? ExceptionAnnualizedReaderTotal : AnnualizedReaderTotal;
                }

                return AnnualizedReaderTotal;
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

            builder.Entity<Request>()
                .HasMany(r => r.History)
                .WithOne(h => h.Request)
                .OnDelete(DeleteBehavior.NoAction);
;        }

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
