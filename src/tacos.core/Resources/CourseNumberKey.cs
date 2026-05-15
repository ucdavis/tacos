using System.Linq;

namespace tacos.core.Resources
{
    public static class CourseNumberKey
    {
        public static string Normalize(string courseNumber)
        {
            if (courseNumber == null)
            {
                return null;
            }

            return new string(courseNumber
                .Where(c => !char.IsWhiteSpace(c))
                .ToArray())
                .ToUpperInvariant();
        }
    }
}
