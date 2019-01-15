using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace tacos.mvc.Data
{
    public class CourseDescription
    {
        [Key]
        public string Course { get; set; }

        public string SubjectCode { get; set; }

        public string CourseNumber { get; set; }

        public string CrossListing { get; set; }

        public string Title { get; set; }

        public string AbbreviatedTitle { get; set; }
        
        [Column("CourseDescription")]
        public string Description { get; set; }

        public string College { get; set; }

        public string Department { get; set; }

        public string Status { get; set; }

        public string CreatedOn { get; set; }

        public string UpdatedOn { get; set; }

        public string FirstLearningActivity { get; set; }

        public string SecondLearningActivity { get; set; }

        public string ThirdLearningActivity { get; set; }

        public string FourthLearningActivity { get; set; }

        public string Quarters { get; set; }

        public string QuartersOffered { get; set; }

        public string EffectiveTerm { get; set; }

        public string Effective { get; set; }

        public static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<CourseDescription>()
                .ToTable("CourseDescription");
        }
    }
}
