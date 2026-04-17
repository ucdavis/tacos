using System;
using tacos.core.Data;

namespace tacos.mvc.services
{
    public readonly record struct RequestCalculationInput(
        string CourseType,
        double ExceptionTaTotal,
        double ExceptionReaderTotal,
        double ExceptionAnnualCount
    );

    public readonly record struct RequestSupportTotals(
        double CalculatedTaTotal,
        double CalculatedReaderTotal,
        double AnnualizedTaTotal,
        double AnnualizedReaderTotal,
        double ExceptionTaTotal,
        double ExceptionReaderTotal,
        double ExceptionAnnualizedTaTotal,
        double ExceptionAnnualizedReaderTotal
    );

    internal readonly record struct FormulaSupport(double TaPerOffering, double ReaderPerOffering);

    public interface IRequestCalculationService
    {
        RequestSupportTotals Calculate(Course course, RequestCalculationInput input);
    }

    public class RequestCalculationService : IRequestCalculationService
    {
        private const double AnnualizationRatio = 4.0 / 12.0;

        public RequestSupportTotals Calculate(Course course, RequestCalculationInput input)
        {
            var perOfferingSupport = CalculatePerOffering(course, input.CourseType);
            var annualizedSupport = AnnualizeCourseSupport(course, perOfferingSupport);

            return new RequestSupportTotals(
                CalculatedTaTotal: perOfferingSupport.TaPerOffering,
                CalculatedReaderTotal: perOfferingSupport.ReaderPerOffering,
                AnnualizedTaTotal: annualizedSupport.TaPerOffering,
                AnnualizedReaderTotal: annualizedSupport.ReaderPerOffering,
                ExceptionTaTotal: input.ExceptionTaTotal,
                ExceptionReaderTotal: input.ExceptionReaderTotal,
                ExceptionAnnualizedTaTotal: input.ExceptionTaTotal * input.ExceptionAnnualCount * AnnualizationRatio,
                ExceptionAnnualizedReaderTotal: input.ExceptionReaderTotal * input.ExceptionAnnualCount * AnnualizationRatio
            );
        }

        private static FormulaSupport CalculatePerOffering(Course course, string courseType)
        {
            return courseType switch
            {
                "STD" => CalculateStandardLecture(course),
                "WRT" => CalculateWritingLecture(course),
                "LAB" => CalculateLab(course),
                "FLD" => CalculateField(course),
                "AUTO" => CalculateLectureAutoGrading(course),
                "MAN" => CalculateLectureManualGrading(course),
                "MODW" => CalculateLectureModerateWriting(course),
                "INT" => CalculateLectureIntensive(course),
                _ => NoSupport()
            };
        }

        private static FormulaSupport AnnualizeCourseSupport(Course course, FormulaSupport perOfferingSupport)
        {
            var annualizedTaTotal = perOfferingSupport.TaPerOffering * AnnualizationRatio * course.TimesOfferedPerYear;
            var annualizedReaderTotal = perOfferingSupport.ReaderPerOffering * AnnualizationRatio * course.TimesOfferedPerYear;

            if (course.IsCourseTaughtOnceEveryTwoYears)
            {
                if (course.WasCourseTaughtInMostRecentYear)
                {
                    annualizedTaTotal = 0;
                    annualizedReaderTotal = 0;
                }
                else
                {
                    annualizedTaTotal *= 2;
                    annualizedReaderTotal *= 2;
                }
            }

            return new FormulaSupport(annualizedTaTotal, annualizedReaderTotal);
        }

        private static FormulaSupport CalculateStandardLecture(Course course)
        {
            if (course.AverageEnrollment < 55.0)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo((course.AverageEnrollment / 55.0) * 0.5, 0.5));
        }

        private static FormulaSupport CalculateWritingLecture(Course course)
        {
            var sectionsPerCourse = NormalizedSectionsPerCourse(course);

            if (sectionsPerCourse < 2)
            {
                return NoSupport();
            }

            if (course.AverageEnrollment / sectionsPerCourse < 20.0)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo((sectionsPerCourse / 2.0) * 0.5, 0.5));
        }

        private static FormulaSupport CalculateLab(Course course)
        {
            if (course.AverageEnrollment < 25)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo((course.AverageEnrollment / 30.0) * 0.5, 0.5));
        }

        private static FormulaSupport CalculateField(Course course)
        {
            return TaOnly(RoundTo((course.AverageEnrollment / 25.0) * 0.5, 0.5));
        }

        private static FormulaSupport CalculateLectureAutoGrading(Course course)
        {
            if (course.AverageEnrollment < 150)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo(0.25 + ((course.AverageEnrollment - 150) / 100.0) * 0.25, 0.25));
        }

        private static FormulaSupport CalculateLectureManualGrading(Course course)
        {
            if (course.AverageEnrollment < 150)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo(
                0.25 +
                ((course.AverageEnrollment - 150) / 100.0) * 0.25 +
                (course.AverageEnrollment / 100.0) * 0.25,
                0.25
            ));
        }

        private static FormulaSupport CalculateLectureModerateWriting(Course course)
        {
            if (course.AverageEnrollment < 100)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo((course.AverageEnrollment / 100.0) * 0.25, 0.25));
        }

        private static FormulaSupport CalculateLectureIntensive(Course course)
        {
            if (course.AverageEnrollment < 40)
            {
                return NoSupport();
            }

            return TaOnly(RoundTo((course.AverageEnrollment / 40.0) * 0.25, 0.25));
        }

        private static FormulaSupport NoSupport()
        {
            return new FormulaSupport(0, 0);
        }

        private static FormulaSupport TaOnly(double taPerOffering)
        {
            return new FormulaSupport(taPerOffering, 0);
        }

        private static double NormalizedSectionsPerCourse(Course course)
        {
            return 2 * Math.Floor(course.AverageSectionsPerCourse / 2);
        }

        private static double RoundTo(double value, double unit)
        {
            return unit * Math.Round(value / unit, MidpointRounding.AwayFromZero);
        }
    }
}
