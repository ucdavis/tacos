using System;
using tacos.core.Data;

namespace tacos.core.Services
{
    public sealed record TaAllocationTotals(
        double CalculatedTotal,
        double AnnualizedTotal,
        double ExceptionAnnualizedTotal);

    public static class TaAllocationCalculator
    {
        public const double AnnualizationRatio = 4.0 / 12.0;

        public static TaAllocationTotals Calculate(
            string courseType,
            Course course,
            double exceptionTotal = 0,
            double exceptionAnnualCount = 0)
        {
            if (course == null)
            {
                return new TaAllocationTotals(0, 0, 0);
            }

            var calculatedTotal = CalculatePerCourse(courseType, course);
            var annualizedTotal = CalculateAnnualizedTotal(calculatedTotal, course);
            var exceptionAnnualizedTotal = CalculateExceptionAnnualizedTotal(exceptionTotal, exceptionAnnualCount);

            return new TaAllocationTotals(calculatedTotal, annualizedTotal, exceptionAnnualizedTotal);
        }

        public static double CalculatePerCourse(string courseType, Course course)
        {
            if (course == null || string.IsNullOrWhiteSpace(courseType))
            {
                return 0;
            }

            return courseType.ToUpperInvariant() switch
            {
                "STD" => CalculateStandardLecture(course),
                "WRT" => CalculateWritingLecture(course),
                "LAB" => CalculateLab(course),
                "FLD" => CalculateField(course),
                "AUTO" => CalculateLectureAutoGrading(course),
                "MAN" => CalculateLectureManualGrading(course),
                "MODW" => CalculateLectureModerateWriting(course),
                "INT" => CalculateLectureIntensive(course),
                _ => 0,
            };
        }

        public static double CalculateAnnualizedTotal(double calculatedTotal, Course course)
        {
            if (course == null)
            {
                return 0;
            }

            var annualizedTotal = calculatedTotal * AnnualizationRatio * course.TimesOfferedPerYear;

            if (!course.IsCourseTaughtOnceEveryTwoYears)
            {
                return annualizedTotal;
            }

            return course.WasCourseTaughtInMostRecentYear
                ? 0
                : annualizedTotal * 2;
        }

        public static double CalculateExceptionAnnualizedTotal(double exceptionTotal, double exceptionAnnualCount)
        {
            return exceptionTotal * AnnualizationRatio * exceptionAnnualCount;
        }

        private static double CalculateStandardLecture(Course course)
        {
            if (course.AverageEnrollment < 55.0)
            {
                return 0;
            }

            return RoundTo((course.AverageEnrollment / 55.0) * 0.5, 0.5);
        }

        private static double CalculateWritingLecture(Course course)
        {
            var sectionsPerCourse = NormalizeSectionsPerCourse(course);

            if (sectionsPerCourse < 2)
            {
                return 0;
            }

            if (course.AverageEnrollment / sectionsPerCourse < 20.0)
            {
                return 0;
            }

            return RoundTo((sectionsPerCourse / 2.0) * 0.5, 0.5);
        }

        private static double CalculateLab(Course course)
        {
            if (course.AverageEnrollment < 25)
            {
                return 0;
            }

            return RoundTo((course.AverageEnrollment / 30.0) * 0.5, 0.5);
        }

        private static double CalculateField(Course course)
        {
            return RoundTo((course.AverageEnrollment / 25.0) * 0.5, 0.5);
        }

        private static double CalculateLectureAutoGrading(Course course)
        {
            if (course.AverageEnrollment < 150)
            {
                return 0;
            }

            return RoundTo(0.25 + ((course.AverageEnrollment - 150) / 100.0) * 0.25, 0.25);
        }

        private static double CalculateLectureManualGrading(Course course)
        {
            if (course.AverageEnrollment < 150)
            {
                return 0;
            }

            return RoundTo(
                0.25 +
                ((course.AverageEnrollment - 150) / 100.0) * 0.25 +
                (course.AverageEnrollment / 100.0) * 0.25,
                0.25);
        }

        private static double CalculateLectureModerateWriting(Course course)
        {
            if (course.AverageEnrollment < 100)
            {
                return 0;
            }

            return RoundTo((course.AverageEnrollment / 100.0) * 0.25, 0.25);
        }

        private static double CalculateLectureIntensive(Course course)
        {
            if (course.AverageEnrollment < 40)
            {
                return 0;
            }

            return RoundTo((course.AverageEnrollment / 40.0) * 0.25, 0.25);
        }

        private static double NormalizeSectionsPerCourse(Course course)
        {
            return 2 * Math.Floor(course.AverageSectionsPerCourse / 2);
        }

        private static double RoundTo(double value, double unit)
        {
            return unit * Math.Round(value / unit, MidpointRounding.AwayFromZero);
        }
    }
}
