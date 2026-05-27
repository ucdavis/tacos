using System.Collections.Generic;
using tacos.core.Data;

namespace tacos.mvc.Models.CourseViewModels
{
    public class CourseIndexViewModel
    {
        public string Query { get; set; }

        public string NormalizedQuery { get; set; }

        public bool HasSearched { get; set; }

        public bool IsValidSearch { get; set; } = true;

        public string ValidationMessage { get; set; }

        public IList<Course> Courses { get; set; } = new List<Course>();
    }
}
