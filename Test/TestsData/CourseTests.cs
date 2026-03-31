using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using Shouldly;
using tacos.core.Data;
using Xunit;

namespace Test.TestsData
{
    [Trait("Category", "DatabaseTests")]
    public class CourseTests
    {
        [Fact]
        public void Course_should_expose_the_expected_public_properties()
        {
            var expectedProperties = new Dictionary<string, string>
            {
                ["AverageEnrollment"] = typeof(double).FullName,
                ["AverageSectionsPerCourse"] = typeof(double).FullName,
                ["CrossListingsString"] = typeof(string).FullName,
                ["DeptName"] = typeof(string).FullName,
                ["IsCourseTaughtOnceEveryTwoYears"] = typeof(bool).FullName,
                ["IsCrossListed"] = typeof(bool).FullName,
                ["IsOfferedWithinPastTwoYears"] = typeof(bool).FullName,
                ["Name"] = typeof(string).FullName,
                ["NonCrossListedAverageEnrollment"] = typeof(double).FullName,
                ["Number"] = typeof(string).FullName,
                ["TimesOfferedPerYear"] = typeof(double).FullName,
                ["WasCourseTaughtInMostRecentYear"] = typeof(bool).FullName,
            };

            var actualProperties = typeof(Course)
                .GetProperties(BindingFlags.Instance | BindingFlags.Public)
                .Select(p => new KeyValuePair<string, string>(p.Name, p.PropertyType.FullName))
                .OrderBy(p => p.Key)
                .ToArray();

            expectedProperties
                .OrderBy(p => p.Key)
                .ToArray()
                .ShouldBe(actualProperties);

            typeof(Course)
                .GetProperty(nameof(Course.Number))
                .ShouldNotBeNull()
                .GetCustomAttribute<KeyAttribute>()
                .ShouldNotBeNull();

        }
    }
}
