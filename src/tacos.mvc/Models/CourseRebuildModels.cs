using System.Collections.Generic;

namespace tacos.mvc.Models
{
    public class CourseRebuildRequestModel
    {
        public IList<string> AcademicTermCodes { get; set; } = new List<string>();
    }

    public class CourseRebuildResultModel
    {
        public string AcademicYearSpan { get; set; }

        public int StartingAcademicYear { get; set; }

        public IList<string> AcademicTermCodes { get; set; } = new List<string>();
    }

    public class AcademicYearSpanOptionModel
    {
        public string AcademicYearSpan { get; set; }

        public int StartingAcademicYear { get; set; }

        public bool IsComplete { get; set; }

        public IList<AcademicTermCodeOptionModel> Terms { get; set; } = new List<AcademicTermCodeOptionModel>();
    }

    public class AcademicTermCodeOptionModel
    {
        public string AcademicTermCode { get; set; }

        public int TermOrder { get; set; }

        public bool IsAvailable { get; set; }
    }
}
