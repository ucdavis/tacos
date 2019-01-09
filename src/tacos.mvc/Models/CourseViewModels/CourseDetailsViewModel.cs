using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tacos.data;
using tacos.mvc.Data;

namespace tacos.mvc.Models.CourseViewModels
{
    public class CourseDetailsViewModel
    {
        public Course Course { get; set; }

        public CourseDescription Description { get; set; }
    }
}
