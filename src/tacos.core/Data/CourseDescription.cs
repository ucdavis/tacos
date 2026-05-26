using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace tacos.core.Data
{
    public class CourseDescription
    {
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

        public DateTime? CreatedOn { get; set; }

        public DateTime? UpdatedOn { get; set; }

        public string FirstLearningActivity { get; set; }

        public string FirstContactHoursPeriod { get; set; }

        public string SecondLearningActivity { get; set; }

        public string SecondContactHoursPeriod { get; set; }

        public string ThirdLearningActivity { get; set; }

        public string ThirdContactHoursPeriod { get; set; }

        public string FourthLearningActivity { get; set; }

        public string FourthContactHoursPeriod { get; set; }

        public string Ge2ArtsHumanities { get; set; }

        public string Ge2ScienceEngineering { get; set; }

        public string Ge2SocialSciences { get; set; }

        public string Ge2Diversity { get; set; }

        public string Ge2WritingExperience { get; set; }

        public string Ge3ArtsHumanities { get; set; }

        public string Ge3ScienceEngineering { get; set; }

        public string Ge3SocialSciences { get; set; }

        public string Ge3AmericanCultures { get; set; }

        public string Ge3DomesticDiversity { get; set; }

        public string Ge3OralLiteracy { get; set; }

        public string Ge3QuantitativeLiteracy { get; set; }

        public string Ge3ScientificLiteracy { get; set; }

        public string Ge3VisualLiteracy { get; set; }

        public string Ge3WorldCultures { get; set; }

        public string Ge3WritingExperience { get; set; }

        public string Quarters { get; set; }

        public string QuartersOffered { get; set; }

        public string EffectiveTerm { get; set; }

        public string Effective { get; set; }

        public static void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<CourseDescription>()
                .ToTable("CourseDescription")
                .HasKey(x => new { x.SubjectCode, x.CourseNumber, x.Status });

            builder.Entity<CourseDescription>()
                .Property(x => x.Course)
                .HasMaxLength(20);

            builder.Entity<CourseDescription>()
                .Property(x => x.SubjectCode)
                .HasMaxLength(20)
                .IsRequired();

            builder.Entity<CourseDescription>()
                .Property(x => x.CourseNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Entity<CourseDescription>()
                .Property(x => x.CrossListing)
                .HasMaxLength(200);

            builder.Entity<CourseDescription>()
                .Property(x => x.Title)
                .HasMaxLength(255);

            builder.Entity<CourseDescription>()
                .Property(x => x.AbbreviatedTitle)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.College)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Department)
                .HasMaxLength(200);

            builder.Entity<CourseDescription>()
                .Property(x => x.Status)
                .HasMaxLength(50)
                .IsRequired();

            builder.Entity<CourseDescription>()
                .Property(x => x.CreatedOn)
                .HasPrecision(6);

            builder.Entity<CourseDescription>()
                .Property(x => x.UpdatedOn)
                .HasPrecision(6);

            builder.Entity<CourseDescription>()
                .Property(x => x.FirstLearningActivity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.FirstContactHoursPeriod)
                .HasMaxLength(50);

            builder.Entity<CourseDescription>()
                .Property(x => x.SecondLearningActivity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.SecondContactHoursPeriod)
                .HasMaxLength(50);

            builder.Entity<CourseDescription>()
                .Property(x => x.ThirdLearningActivity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.ThirdContactHoursPeriod)
                .HasMaxLength(50);

            builder.Entity<CourseDescription>()
                .Property(x => x.FourthLearningActivity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.FourthContactHoursPeriod)
                .HasMaxLength(50);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge2ArtsHumanities)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge2ScienceEngineering)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge2SocialSciences)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge2Diversity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge2WritingExperience)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3ArtsHumanities)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3ScienceEngineering)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3SocialSciences)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3AmericanCultures)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3DomesticDiversity)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3OralLiteracy)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3QuantitativeLiteracy)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3ScientificLiteracy)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3VisualLiteracy)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3WorldCultures)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Ge3WritingExperience)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.Quarters)
                .HasMaxLength(300);

            builder.Entity<CourseDescription>()
                .Property(x => x.QuartersOffered)
                .HasMaxLength(100);

            builder.Entity<CourseDescription>()
                .Property(x => x.EffectiveTerm)
                .HasMaxLength(6);

            builder.Entity<CourseDescription>()
                .Property(x => x.Effective)
                .HasMaxLength(100);
        }
    }
}
