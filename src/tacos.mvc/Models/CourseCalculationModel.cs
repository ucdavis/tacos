namespace tacos.mvc.Models
{
    public class CourseCalculationModel
    {
        public string Number { get; set; }

        public string Name { get; set; }

        public double AverageEnrollment { get; set; }

        public double AverageSectionsPerCourse { get; set; }

        public double TimesOfferedPerYear { get; set; }

        public bool WasCourseTaughtInMostRecentYear { get; set; }

        public bool IsCourseTaughtOnceEveryTwoYears { get; set; }
    }
}
