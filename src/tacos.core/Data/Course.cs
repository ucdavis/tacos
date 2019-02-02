using System.ComponentModel.DataAnnotations;

namespace tacos.core.Data
{
    public class Course {
        // course number, ex: MAT110
        [Key]
        public string Number { get; set; }

        public string Name { get; set; }

        public double AverageSectionsPerCourse { get; set; }

        public double AverageEnrollment { get; set; }

        public double TimesOfferedPerYear { get; set; }
    }
}
