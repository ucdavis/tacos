namespace tacos.data
{
    // request for a specific course
    public class Request {
        public int Id { get; set; }

        public Submission Submission { get; set; }

        public int SubmissionId { get; set; }

        public string CourseNumber { get; set; }

        // calculated total of TAs, regardless of what is requested
        public double CalculatedTotal { get; set; }
        public bool Approved { get; set; }
    }
        
}
