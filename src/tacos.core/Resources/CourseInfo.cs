using System.Collections.Generic;

namespace tacos.core.Resources
{
    public static class CourseInfo
    {
        public static readonly Dictionary<string, string> Types =
            new Dictionary<string, string> {
                { "STD", "Standard lecture" },
                { "WRT", "Writing intensive lecture" },
                { "LAB", "Lab or Studio classes" },
                { "FLD", "Field classes" },
                { "AUTO", "Lecture only, automated grading" },
                { "MAN", "Lecture only, manual grading" },
                { "MODW", "Lecture only, moderate writing" },
                { "INT", "Lecture only, writing intensive or substantial project" }
            };

        public static readonly Dictionary<string, string> Requests =
            new Dictionary<string, string> {
                {"READ", "Reader"},
                {"TA", "TA"}
            };
    }
}
