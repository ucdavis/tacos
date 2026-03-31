using Shouldly;
using tacos.core.Data;
using tacos.core.Services;
using Xunit;

namespace Test.Services
{
    public class TaAllocationCalculatorTests
    {
        [Theory]
        [InlineData("STD", 54, 0, 0)]
        [InlineData("STD", 55, 0, 0.5)]
        [InlineData("STD", 111, 0, 1.0)]
        [InlineData("LAB", 24, 0, 0)]
        [InlineData("LAB", 45, 0, 1.0)]
        [InlineData("FLD", 25, 0, 0.5)]
        [InlineData("AUTO", 149, 0, 0)]
        [InlineData("AUTO", 150, 0, 0.25)]
        [InlineData("AUTO", 250, 0, 0.5)]
        [InlineData("MAN", 150, 0, 0.75)]
        [InlineData("MAN", 250, 0, 1.25)]
        [InlineData("MODW", 99, 0, 0)]
        [InlineData("MODW", 100, 0, 0.25)]
        [InlineData("MODW", 250, 0, 0.75)]
        [InlineData("INT", 39, 0, 0)]
        [InlineData("INT", 40, 0, 0.25)]
        [InlineData("INT", 100, 0, 0.75)]
        public void CalculatePerCourse_should_apply_thresholds_and_rounding(
            string courseType,
            double averageEnrollment,
            double averageSectionsPerCourse,
            double expected)
        {
            var course = CreateCourse(
                averageEnrollment: averageEnrollment,
                averageSectionsPerCourse: averageSectionsPerCourse);

            var actual = TaAllocationCalculator.CalculatePerCourse(courseType, course);

            actual.ShouldBe(expected);
        }

        [Theory]
        [InlineData(1.9, 80, 0)]
        [InlineData(2.0, 39, 0)]
        [InlineData(5.0, 80, 1.0)]
        public void CalculatePerCourse_should_normalize_writing_sections_before_calculating(
            double averageSectionsPerCourse,
            double averageEnrollment,
            double expected)
        {
            var course = CreateCourse(
                averageEnrollment: averageEnrollment,
                averageSectionsPerCourse: averageSectionsPerCourse);

            var actual = TaAllocationCalculator.CalculatePerCourse("WRT", course);

            actual.ShouldBe(expected);
        }

        [Fact]
        public void Calculate_should_return_all_totals_for_a_request()
        {
            var course = CreateCourse(
                averageEnrollment: 111,
                timesOfferedPerYear: 2);

            var totals = TaAllocationCalculator.Calculate(
                "STD",
                course,
                exceptionTotal: 1.25,
                exceptionAnnualCount: 2);

            totals.CalculatedTotal.ShouldBe(1.0);
            totals.AnnualizedTotal.ShouldBe(2.0 / 3.0, 0.0001);
            totals.ExceptionAnnualizedTotal.ShouldBe(5.0 / 6.0, 0.0001);
        }

        [Fact]
        public void Calculate_should_preserve_exception_annualized_total_when_course_is_null()
        {
            var totals = TaAllocationCalculator.Calculate(
                "STD",
                null,
                exceptionTotal: 1.25,
                exceptionAnnualCount: 2);

            totals.CalculatedTotal.ShouldBe(0);
            totals.AnnualizedTotal.ShouldBe(0);
            totals.ExceptionAnnualizedTotal.ShouldBe(5.0 / 6.0, 0.0001);
        }

        [Fact]
        public void CalculateAnnualizedTotal_should_zero_out_every_other_year_courses_in_the_off_year()
        {
            var course = CreateCourse(
                averageEnrollment: 25,
                timesOfferedPerYear: 1,
                isCourseTaughtOnceEveryTwoYears: true,
                wasCourseTaughtInMostRecentYear: true);

            var annualizedTotal = TaAllocationCalculator.CalculateAnnualizedTotal(0.5, course);

            annualizedTotal.ShouldBe(0);
        }

        [Fact]
        public void CalculateAnnualizedTotal_should_double_every_other_year_courses_in_the_on_year()
        {
            var course = CreateCourse(
                averageEnrollment: 25,
                timesOfferedPerYear: 1,
                isCourseTaughtOnceEveryTwoYears: true,
                wasCourseTaughtInMostRecentYear: false);

            var annualizedTotal = TaAllocationCalculator.CalculateAnnualizedTotal(0.5, course);

            annualizedTotal.ShouldBe(1.0 / 3.0, 0.0001);
        }

        [Fact]
        public void AnnualizationRatio_should_match_the_quarter_system_conversion()
        {
            TaAllocationCalculator.AnnualizationRatio.ShouldBe(1.0 / 3.0, 0.0001);
        }

        private static Course CreateCourse(
            double averageEnrollment,
            double averageSectionsPerCourse = 0,
            double timesOfferedPerYear = 1,
            bool isCourseTaughtOnceEveryTwoYears = false,
            bool wasCourseTaughtInMostRecentYear = false)
        {
            return new Course
            {
                AverageEnrollment = averageEnrollment,
                AverageSectionsPerCourse = averageSectionsPerCourse,
                CrossListingsString = string.Empty,
                IsCourseTaughtOnceEveryTwoYears = isCourseTaughtOnceEveryTwoYears,
                IsCrossListed = false,
                IsOfferedWithinPastTwoYears = true,
                Name = "ECS 001",
                Number = "ECS001",
                TimesOfferedPerYear = timesOfferedPerYear,
                WasCourseTaughtInMostRecentYear = wasCourseTaughtInMostRecentYear,
            };
        }
    }
}
