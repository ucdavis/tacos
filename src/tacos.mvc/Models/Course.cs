namespace tacos.mvc.Models
{
    public class Course {
        public string Number { get; set; }

        public string Name { get; set; }

        public int TimesOfferedPerYear { get; set; }
        public int AverageSectionsPerCourse { get; set; }
        public int AverageEnrollment { get; set; }
    }
}