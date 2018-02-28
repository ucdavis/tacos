using System.ComponentModel.DataAnnotations;

namespace tacos.data
{
    public class Course {
        // course number, ex: MAT110
        [Key]
        public string Number { get; set; }

        public string Name { get; set; }

        public int TimesOfferedPerYear { get; set; }
        public int AverageSectionsPerCourse { get; set; }
        public int AverageEnrollment { get; set; }
    }
}