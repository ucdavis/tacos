namespace tacos.data
{
    // request for a specific course
    public class Request
    {
        public int Id { get; set; }

        public Submission Submission { get; set; }

        public int SubmissionId { get; set; }

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

        public double Total
        {
            get
            {
                if (Approved.HasValue) {
                    // if we've made a decision
                    if (Approved.Value) {
                        return Exception ? ExceptionAnnualizedTotal : AnnualizedTotal;
                    } else {
                        return AnnualizedTotal;
                    }
                } else {
                    return 0;
                }
            }
        }
    }
}
