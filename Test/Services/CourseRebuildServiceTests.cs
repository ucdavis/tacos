using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using tacos.mvc.services;
using Xunit;

namespace Test.Services
{
    [Trait("Category", "Service")]
    public class CourseRebuildServiceTests
    {
        [Fact]
        public async Task GetAcademicYearSpanOptions_should_group_term_rows_by_academic_year_span()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: true)
                    .Concat(CreateSpanRows(2024, isComplete: false, missingTermOrder: 1))
                    .ToList()
            };
            var service = new CourseRebuildService(gateway);

            var options = await service.GetAcademicYearSpanOptionsAsync();

            options.Count.ShouldBe(2);
            options[0].AcademicYearSpan.ShouldBe("2025-26");
            options[0].IsComplete.ShouldBeTrue();
            options[0].Terms.Select(t => t.AcademicTermCode).ShouldBe(new[]
            {
                "202410",
                "202501",
                "202503",
                "202510",
                "202601",
                "202603"
            });
            options[1].AcademicYearSpan.ShouldBe("2024-25");
            options[1].IsComplete.ShouldBeFalse();
        }

        [Fact]
        public async Task RebuildCourses_should_validate_and_execute_with_ordered_processing_terms()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: true).ToList()
            };
            var service = new CourseRebuildService(gateway);

            var result = await service.RebuildCoursesAsync(new[]
            {
                "202603",
                "202510",
                "202410",
                "202501",
                "202601",
                "202503"
            });

            gateway.RebuildCalls.Count.ShouldBe(1);
            gateway.RebuildCalls[0].ShouldBe(new[]
            {
                "202410",
                "202501",
                "202503",
                "202510",
                "202601",
                "202603"
            });
            result.AcademicYearSpan.ShouldBe("2025-26");
            result.StartingAcademicYear.ShouldBe(2025);
        }

        [Fact]
        public async Task RebuildCourses_should_reject_malformed_term_codes()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: true).ToList()
            };
            var service = new CourseRebuildService(gateway);

            await Should.ThrowAsync<CourseRebuildValidationException>(() => service.RebuildCoursesAsync(new[]
            {
                "202410",
                "202501",
                "202503",
                "202510",
                "202601",
                "202604"
            }));

            gateway.RebuildCalls.ShouldBeEmpty();
        }

        [Fact]
        public async Task RebuildCourses_should_reject_incomplete_processing_windows()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: true).ToList()
            };
            var service = new CourseRebuildService(gateway);

            await Should.ThrowAsync<CourseRebuildValidationException>(() => service.RebuildCoursesAsync(new[]
            {
                "202410",
                "202501",
                "202503"
            }));

            gateway.RebuildCalls.ShouldBeEmpty();
        }

        [Fact]
        public async Task RebuildCourses_should_reject_duplicate_term_codes()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: true).ToList()
            };
            var service = new CourseRebuildService(gateway);

            await Should.ThrowAsync<CourseRebuildValidationException>(() => service.RebuildCoursesAsync(new[]
            {
                "202410",
                "202410",
                "202503",
                "202510",
                "202601",
                "202603"
            }));

            gateway.RebuildCalls.ShouldBeEmpty();
        }

        [Fact]
        public async Task RebuildCourses_should_reject_windows_that_are_not_available_from_source_terms()
        {
            var gateway = new FakeCourseRebuildSqlGateway
            {
                Rows = CreateSpanRows(2025, isComplete: false, missingTermOrder: 6).ToList()
            };
            var service = new CourseRebuildService(gateway);

            await Should.ThrowAsync<CourseRebuildValidationException>(() => service.RebuildCoursesAsync(new[]
            {
                "202410",
                "202501",
                "202503",
                "202510",
                "202601",
                "202603"
            }));

            gateway.RebuildCalls.ShouldBeEmpty();
        }

        private static IEnumerable<CourseRebuildAcademicYearSpanTermRow> CreateSpanRows(
            int startingAcademicYear,
            bool isComplete,
            int? missingTermOrder = null)
        {
            var termCodes = new[]
            {
                $"{startingAcademicYear - 1}10",
                $"{startingAcademicYear}01",
                $"{startingAcademicYear}03",
                $"{startingAcademicYear}10",
                $"{startingAcademicYear + 1}01",
                $"{startingAcademicYear + 1}03"
            };
            var span = $"{startingAcademicYear}-{(startingAcademicYear + 1) % 100:00}";

            for (var i = 0; i < termCodes.Length; i++)
            {
                var termOrder = i + 1;
                var isAvailable = missingTermOrder != termOrder;

                yield return new CourseRebuildAcademicYearSpanTermRow(
                    span,
                    startingAcademicYear,
                    termCodes[i],
                    termOrder,
                    isAvailable,
                    isComplete
                );
            }
        }

        private class FakeCourseRebuildSqlGateway : ICourseRebuildSqlGateway
        {
            public IReadOnlyList<CourseRebuildAcademicYearSpanTermRow> Rows { get; set; }
                = new List<CourseRebuildAcademicYearSpanTermRow>();

            public IList<IReadOnlyList<string>> RebuildCalls { get; } = new List<IReadOnlyList<string>>();

            public Task<IReadOnlyList<CourseRebuildAcademicYearSpanTermRow>> GetAcademicYearSpanTermRowsAsync()
            {
                return Task.FromResult(Rows);
            }

            public Task RebuildCoursesAsync(IReadOnlyList<string> academicTermCodes)
            {
                RebuildCalls.Add(academicTermCodes.ToList());
                return Task.CompletedTask;
            }
        }
    }
}
