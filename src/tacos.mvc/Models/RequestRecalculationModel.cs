namespace tacos.mvc.Models
{
    public class RequestRecalculationModel
    {
        public int DepartmentId { get; set; }

        public string CourseNumber { get; set; }

        public string CourseType { get; set; }

        public bool Exception { get; set; }

        public double ExceptionTaTotal { get; set; }

        public double ExceptionReaderTotal { get; set; }

        public double ExceptionAnnualCount { get; set; }

        public CourseCalculationModel Course { get; set; }
    }
}
