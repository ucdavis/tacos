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

        public bool Contested { get; set; }

        public string ContestReason { get; set; }

        public double ContestTotal { get; set; }

        public double AverageSectionsPerCourse { get; set; }

        public double AverageEnrollment { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }
        public bool? Approved { get; set; }

        public double Total
        {
            get
            {
                if (Approved.HasValue) {
                    // if we've made a decision
                    if (Approved.Value) {
                        return Contested ? ContestTotal : CalculatedTotal;
                    } else {
                        return CalculatedTotal;
                    }
                } else {
                    return 0;
                }
            }
        }
    }
}
