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
            // Standard lecture classes with sections
            // (Grading is through tests and/or short papers; sections typically 1 hour)
            if (course.AverageEnrollment < 55.0)
            {
                return 0;
            }

            // Half-time TA per 55 students for courses with 55 or more students
            return RoundTo((course.AverageEnrollment / 55.0) * 0.5, 0.5);
        }

        private static double CalculateWritingLecture(Course course)
        {
            // Writing intensive lecture classes with sections
            // (GE writing or >=10 page papers)
            var sectionsPerCourse = NormalizeSectionsPerCourse(course);

            // minimum sections - minimum avg non-credit sections is 2 in order to be eligible for funding
            if (sectionsPerCourse < 2)
            {
                return 0;
            }

            // minimum enrollment - minimum section size is 20
            if (course.AverageEnrollment / sectionsPerCourse < 20.0)
            {
                return 0;
            }

            // Discussion sections average 20-25 students
            // Half-time TA is responsible for 2 discussion sections, i.e. 40 students
            return RoundTo((sectionsPerCourse / 2.0) * 0.5, 0.5);
        }

        private static double CalculateLab(Course course)
        {
            // Lab or studio classes
            // (Typically 2-3-hour lab or studio sections)
            // minimum avg enrollment is 25 students in order to be eligible for TA funding
            if (course.AverageEnrollment < 25)
            {
                return 0;
            }

            // Lab/studio sections average 15-20 students
            // Half-time TA is responsible for 2 lab/studio sections, i.e. 25-30 students
            // Alternative: 10-15 students per section if room size, equipment, or safety concerns require
            return RoundTo((course.AverageEnrollment / 30.0) * 0.5, 0.5);
        }

        private static double CalculateField(Course course)
        {
            // Field courses
            // Half-time TA per 25 students
            return RoundTo((course.AverageEnrollment / 25.0) * 0.5, 0.5);
        }

        private static double CalculateLectureAutoGrading(Course course)
        {
            // Lecture-only classes, automated grading
            // (No sections; grading is by Scantron or similar)
            if (course.AverageEnrollment < 150)
            {
                return 0;
            }

            // 25% TA or Reader for first 150 students for courses with 150 or more students
            // Additional 25% TA or Reader for each 100 after that
            return RoundTo(0.25 + ((course.AverageEnrollment - 150) / 100.0) * 0.25, 0.25);
        }

        private static double CalculateLectureManualGrading(Course course)
        {
            // Lecture-only classes, manual grading
            // (Tests require grader attention)
            if (course.AverageEnrollment < 150)
            {
                return 0;
            }

            // 25% TA or Reader for first 150 students for courses with 150 or more students
            // Additional 25% TA or Reader for each 100 after that
            // Plus, 25% of a TA or Reader per 100 students
            return RoundTo(
                0.25 +
                ((course.AverageEnrollment - 150) / 100.0) * 0.25 +
                (course.AverageEnrollment / 100.0) * 0.25,
                0.25);
        }

        private static double CalculateLectureModerateWriting(Course course)
        {
            // Lecture-only classes, moderate writing
            // (5-10 page papers)
            if (course.AverageEnrollment < 100)
            {
                return 0;
            }

            // 25% TA or Reader per 100 students for courses with 100 or more students
            return RoundTo((course.AverageEnrollment / 100.0) * 0.25, 0.25);
        }

        private static double CalculateLectureIntensive(Course course)
        {
            // Lecture-only classes, writing intensive or substantial project
            // (No sections; GE writing or >=10 page papers)
            if (course.AverageEnrollment < 40)
            {
                return 0;
            }

            // 25% TA or Reader per 40 students for courses with 40 or more students
            return RoundTo((course.AverageEnrollment / 40.0) * 0.25, 0.25);
        }

        private static double NormalizeSectionsPerCourse(Course course)
        {
            // normalize by rounding down to even, whole number
            return 2 * Math.Floor(course.AverageSectionsPerCourse / 2);
        }

        private static double RoundTo(double value, double unit)
        {
            return unit * Math.Round(value / unit, MidpointRounding.AwayFromZero);
        }
    }
}
