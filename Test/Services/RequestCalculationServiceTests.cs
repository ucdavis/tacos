using Shouldly;
using tacos.core.Data;
using tacos.mvc.services;
using Xunit;

namespace Test.Services
{
    [Trait("Category", "Service")]
    public class RequestCalculationServiceTests
    {
        private readonly RequestCalculationService _service = new RequestCalculationService();

        [Fact]
        public void Calculate_should_return_no_standard_lecture_support_below_minimum_enrollment()
        {
            var result = Calculate("STD", CreateCourse(averageEnrollment: 54));

            result.CalculatedTaTotal.ShouldBe(0);
            result.CalculatedReaderTotal.ShouldBe(0);
        }

        [Theory]
        [InlineData(55, 0.5)]
        [InlineData(111, 1.0)]
        [InlineData(165, 1.5)]
        public void Calculate_should_round_standard_lecture_support_to_half_time_increments(
            double averageEnrollment,
            double expectedTaTotal)
        {
            var result = Calculate("STD", CreateCourse(averageEnrollment: averageEnrollment));

            result.CalculatedTaTotal.ShouldBe(expectedTaTotal);
            result.CalculatedReaderTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_require_at_least_two_normalized_writing_sections()
        {
            var result = Calculate(
                "WRT",
                CreateCourse(averageEnrollment: 80, averageSectionsPerCourse: 1)
            );

            result.CalculatedTaTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_require_writing_sections_to_average_at_least_twenty_students()
        {
            var result = Calculate(
                "WRT",
                CreateCourse(averageEnrollment: 39, averageSectionsPerCourse: 2)
            );

            result.CalculatedTaTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_normalize_odd_writing_sections_before_calculating_support()
        {
            var result = Calculate(
                "WRT",
                CreateCourse(averageEnrollment: 80, averageSectionsPerCourse: 5)
            );

            result.CalculatedTaTotal.ShouldBe(1);
        }

        [Theory]
        [InlineData("LAB", 24, 0)]
        [InlineData("LAB", 25, 0.5)]
        [InlineData("LAB", 91, 1.5)]
        [InlineData("FLD", 0, 0)]
        [InlineData("FLD", 24, 0.5)]
        [InlineData("FLD", 76, 1.5)]
        [InlineData("AUTO", 149, 0)]
        [InlineData("AUTO", 150, 0.25)]
        [InlineData("AUTO", 250, 0.5)]
        [InlineData("AUTO", 350, 0.75)]
        [InlineData("MAN", 149, 0)]
        [InlineData("MAN", 150, 0.75)]
        [InlineData("MAN", 250, 1.25)]
        [InlineData("MODW", 99, 0)]
        [InlineData("MODW", 100, 0.25)]
        [InlineData("MODW", 250, 0.75)]
        [InlineData("INT", 39, 0)]
        [InlineData("INT", 40, 0.25)]
        [InlineData("INT", 120, 0.75)]
        public void Calculate_should_match_existing_formula_outputs(
            string courseType,
            double averageEnrollment,
            double expectedTaTotal)
        {
            var result = Calculate(courseType, CreateCourse(averageEnrollment: averageEnrollment));

            result.CalculatedTaTotal.ShouldBe(expectedTaTotal);
            result.CalculatedReaderTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_annualize_support_for_normally_offered_courses()
        {
            var result = Calculate("MAN", CreateCourse(averageEnrollment: 250, timesOfferedPerYear: 1));

            result.AnnualizedTaTotal.ShouldBe(0.41666666666666663, 0.000001);
            result.AnnualizedReaderTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_zero_annualized_support_for_every_other_year_courses_taught_in_the_most_recent_year()
        {
            var result = Calculate(
                "MAN",
                CreateCourse(
                    averageEnrollment: 250,
                    timesOfferedPerYear: 1,
                    isCourseTaughtOnceEveryTwoYears: true,
                    wasCourseTaughtInMostRecentYear: true
                )
            );

            result.AnnualizedTaTotal.ShouldBe(0);
            result.AnnualizedReaderTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_double_annualized_support_for_every_other_year_courses_not_taught_in_the_most_recent_year()
        {
            var result = Calculate(
                "MAN",
                CreateCourse(
                    averageEnrollment: 250,
                    timesOfferedPerYear: 1,
                    isCourseTaughtOnceEveryTwoYears: true,
                    wasCourseTaughtInMostRecentYear: false
                )
            );

            result.AnnualizedTaTotal.ShouldBe(0.8333333333333333, 0.000001);
            result.AnnualizedReaderTotal.ShouldBe(0);
        }

        [Fact]
        public void Calculate_should_annualize_exception_support_from_exception_inputs()
        {
            var result = _service.Calculate(
                CreateCourse(),
                new RequestCalculationInput(
                    "STD",
                    ExceptionTaTotal: 1.5,
                    ExceptionReaderTotal: 0.25,
                    ExceptionAnnualCount: 3
                )
            );

            result.ExceptionTaTotal.ShouldBe(1.5);
            result.ExceptionReaderTotal.ShouldBe(0.25);
            result.ExceptionAnnualizedTaTotal.ShouldBe(1.5);
            result.ExceptionAnnualizedReaderTotal.ShouldBe(0.25);
        }

        private RequestSupportTotals Calculate(string courseType, Course course)
        {
            return _service.Calculate(
                course,
                new RequestCalculationInput(
                    courseType,
                    ExceptionTaTotal: 0,
                    ExceptionReaderTotal: 0,
                    ExceptionAnnualCount: 0
                )
            );
        }

        private static Course CreateCourse(
            double averageEnrollment = 0,
            double averageSectionsPerCourse = 0,
            double timesOfferedPerYear = 1,
            bool isCourseTaughtOnceEveryTwoYears = false,
            bool wasCourseTaughtInMostRecentYear = true)
        {
            return new Course
            {
                Number = "ECS 001",
                Name = "ECS 001",
                AverageEnrollment = averageEnrollment,
                AverageSectionsPerCourse = averageSectionsPerCourse,
                TimesOfferedPerYear = timesOfferedPerYear,
                IsOfferedWithinPastTwoYears = true,
                IsCourseTaughtOnceEveryTwoYears = isCourseTaughtOnceEveryTwoYears,
                WasCourseTaughtInMostRecentYear = wasCourseTaughtInMostRecentYear
            };
        }
    }
}
