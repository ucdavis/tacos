using System.Linq;
using tacos.core.Data;
using tacos.core.Resources;

namespace tacos.mvc.Extensions
{
    public static class CourseNumberQueryExtensions
    {
        public static IOrderedQueryable<Course> MatchingCourseNumber(this IQueryable<Course> courses, string courseNumber)
        {
            var normalizedCourseNumber = CourseNumberKey.Normalize(courseNumber);

            return courses
                .Where(c => c.Number
                    .Replace(" ", "")
                    .Replace("\t", "")
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .ToUpper() == normalizedCourseNumber)
                .OrderBy(c => c.Number == normalizedCourseNumber ? 0 : 1);
        }

        public static IOrderedQueryable<CourseDescription> MatchingCourseNumber(
            this IQueryable<CourseDescription> courseDescriptions,
            string courseNumber)
        {
            var normalizedCourseNumber = CourseNumberKey.Normalize(courseNumber);

            return courseDescriptions
                .Where(c => c.Course
                    .Replace(" ", "")
                    .Replace("\t", "")
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .ToUpper() == normalizedCourseNumber)
                .OrderBy(c => c.Course == normalizedCourseNumber ? 0 : 1);
        }

        public static IOrderedQueryable<Request> MatchingCourseNumber(this IQueryable<Request> requests, string courseNumber)
        {
            var normalizedCourseNumber = CourseNumberKey.Normalize(courseNumber);

            return requests
                .Where(r => r.CourseNumber
                    .Replace(" ", "")
                    .Replace("\t", "")
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .ToUpper() == normalizedCourseNumber)
                .OrderBy(r => r.CourseNumber == normalizedCourseNumber ? 0 : 1);
        }
    }
}
