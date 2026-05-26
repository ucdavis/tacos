using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using tacos.core;
using tacos.mvc.Models;

namespace tacos.mvc.services
{
    public class CourseRebuildValidationException : Exception
    {
        public CourseRebuildValidationException(string message) : base(message)
        {
        }
    }

    public readonly record struct CourseRebuildAcademicYearSpanTermRow(
        string AcademicYearSpan,
        int StartingAcademicYear,
        string AcademicTermCode,
        int TermOrder,
        bool IsAvailable,
        bool IsComplete
    );

    public interface ICourseRebuildSqlGateway
    {
        Task<IReadOnlyList<CourseRebuildAcademicYearSpanTermRow>> GetAcademicYearSpanTermRowsAsync();

        Task ReplaceCourseDescriptionsFromRawAsync();

        Task RebuildCoursesAsync(IReadOnlyList<string> academicTermCodes);
    }

    public interface ICourseRebuildService
    {
        Task<IReadOnlyList<AcademicYearSpanOptionModel>> GetAcademicYearSpanOptionsAsync();

        Task<CourseRebuildResultModel> RebuildCoursesAsync(IEnumerable<string> academicTermCodes);
    }

    public class CourseRebuildService : ICourseRebuildService
    {
        private readonly ICourseRebuildSqlGateway _sqlGateway;

        public CourseRebuildService(ICourseRebuildSqlGateway sqlGateway)
        {
            _sqlGateway = sqlGateway;
        }

        public async Task<IReadOnlyList<AcademicYearSpanOptionModel>> GetAcademicYearSpanOptionsAsync()
        {
            var rows = await _sqlGateway.GetAcademicYearSpanTermRowsAsync();

            return rows
                .GroupBy(r => new { r.AcademicYearSpan, r.StartingAcademicYear })
                .OrderByDescending(g => g.Key.StartingAcademicYear)
                .Select(g => new AcademicYearSpanOptionModel
                {
                    AcademicYearSpan = g.Key.AcademicYearSpan,
                    StartingAcademicYear = g.Key.StartingAcademicYear,
                    IsComplete = g.All(r => r.IsAvailable) && g.All(r => r.IsComplete),
                    Terms = g
                        .OrderBy(r => r.TermOrder)
                        .Select(r => new AcademicTermCodeOptionModel
                        {
                            AcademicTermCode = r.AcademicTermCode,
                            TermOrder = r.TermOrder,
                            IsAvailable = r.IsAvailable
                        })
                        .ToList()
                })
                .ToList();
        }

        public async Task<CourseRebuildResultModel> RebuildCoursesAsync(IEnumerable<string> academicTermCodes)
        {
            var processingWindow = CourseProcessingWindow.Validate(academicTermCodes);
            var options = await GetAcademicYearSpanOptionsAsync();

            var matchingOption = options.SingleOrDefault(o => o.StartingAcademicYear == processingWindow.StartingAcademicYear);
            if (matchingOption == null || !matchingOption.IsComplete)
            {
                throw new CourseRebuildValidationException("Selected processing window is incomplete or unavailable.");
            }

            var availableTermCodes = matchingOption.Terms
                .Where(t => t.IsAvailable)
                .Select(t => t.AcademicTermCode)
                .ToHashSet(StringComparer.Ordinal);

            if (!availableTermCodes.SetEquals(processingWindow.AcademicTermCodes))
            {
                throw new CourseRebuildValidationException("Selected processing term codes do not match an available academic year span.");
            }

            await _sqlGateway.ReplaceCourseDescriptionsFromRawAsync();
            await _sqlGateway.RebuildCoursesAsync(processingWindow.AcademicTermCodes);

            return new CourseRebuildResultModel
            {
                AcademicYearSpan = matchingOption.AcademicYearSpan,
                StartingAcademicYear = processingWindow.StartingAcademicYear,
                AcademicTermCodes = processingWindow.AcademicTermCodes.ToList()
            };
        }
    }

    public class CourseRebuildSqlGateway : ICourseRebuildSqlGateway
    {
        private const int DefaultCommandTimeoutSeconds = 300;

        private readonly TacoDbContext _dbContext;

        public CourseRebuildSqlGateway(TacoDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<CourseRebuildAcademicYearSpanTermRow>> GetAcademicYearSpanTermRowsAsync()
        {
            var rows = new List<CourseRebuildAcademicYearSpanTermRow>();

            var connection = GetSqlConnection();
            var shouldCloseConnection = connection.State != ConnectionState.Open;

            if (shouldCloseConnection)
            {
                await connection.OpenAsync();
            }

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = "dbo.usp_GetCourseRebuildAcademicYearSpanOptions";
                command.CommandType = CommandType.StoredProcedure;
                ApplyCommandTimeout(command);

                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    rows.Add(new CourseRebuildAcademicYearSpanTermRow(
                        reader.GetString(reader.GetOrdinal("AcademicYearSpan")),
                        reader.GetInt32(reader.GetOrdinal("StartingAcademicYear")),
                        reader.GetString(reader.GetOrdinal("AcademicTermCode")),
                        reader.GetInt32(reader.GetOrdinal("TermOrder")),
                        reader.GetBoolean(reader.GetOrdinal("IsAvailable")),
                        reader.GetBoolean(reader.GetOrdinal("IsComplete"))
                    ));
                }
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    await connection.CloseAsync();
                }
            }

            return rows;
        }

        public async Task RebuildCoursesAsync(IReadOnlyList<string> academicTermCodes)
        {
            var connection = GetSqlConnection();
            var shouldCloseConnection = connection.State != ConnectionState.Open;

            if (shouldCloseConnection)
            {
                await connection.OpenAsync();
            }

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = "dbo.usp_RebuildCoursesFromProcessingWindow";
                command.CommandType = CommandType.StoredProcedure;
                ApplyCommandTimeout(command);

                var termCodeTable = new DataTable();
                termCodeTable.Columns.Add("AcademicTermCode", typeof(string));

                foreach (var academicTermCode in academicTermCodes)
                {
                    termCodeTable.Rows.Add(academicTermCode);
                }

                command.Parameters.Add(new SqlParameter("@ProcessingTermCodes", SqlDbType.Structured)
                {
                    TypeName = "dbo.AcademicTermCodeList",
                    Value = termCodeTable
                });

                await command.ExecuteNonQueryAsync();
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    await connection.CloseAsync();
                }
            }
        }

        public async Task ReplaceCourseDescriptionsFromRawAsync()
        {
            var connection = GetSqlConnection();
            var shouldCloseConnection = connection.State != ConnectionState.Open;

            if (shouldCloseConnection)
            {
                await connection.OpenAsync();
            }

            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = "dbo.usp_ReplaceCourseDescriptionsFromRaw";
                command.CommandType = CommandType.StoredProcedure;
                ApplyCommandTimeout(command);

                await command.ExecuteNonQueryAsync();
            }
            finally
            {
                if (shouldCloseConnection)
                {
                    await connection.CloseAsync();
                }
            }
        }

        private void ApplyCommandTimeout(SqlCommand command)
        {
            command.CommandTimeout = _dbContext.Database.GetCommandTimeout()
                ?? DefaultCommandTimeoutSeconds;
        }

        private SqlConnection GetSqlConnection()
        {
            if (_dbContext.Database.GetDbConnection() is SqlConnection connection)
            {
                return connection;
            }

            throw new InvalidOperationException("Course rebuild requires a SQL Server database connection.");
        }
    }

    public sealed class CourseProcessingWindow
    {
        private static readonly HashSet<string> RequiredTermSuffixes = new HashSet<string>(StringComparer.Ordinal)
        {
            "10",
            "01",
            "03"
        };

        private CourseProcessingWindow(int startingAcademicYear, IReadOnlyList<string> academicTermCodes)
        {
            StartingAcademicYear = startingAcademicYear;
            AcademicYearSpan = $"{startingAcademicYear}-{(startingAcademicYear + 1) % 100:00}";
            AcademicTermCodes = academicTermCodes;
        }

        public int StartingAcademicYear { get; }

        public string AcademicYearSpan { get; }

        public IReadOnlyList<string> AcademicTermCodes { get; }

        public static CourseProcessingWindow Validate(IEnumerable<string> academicTermCodes)
        {
            if (academicTermCodes == null)
            {
                throw new CourseRebuildValidationException("A processing term set is required.");
            }

            var normalizedTermCodes = academicTermCodes
                .Select(t => t?.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .ToList();

            if (normalizedTermCodes.Count != 6)
            {
                throw new CourseRebuildValidationException("A processing window must contain exactly six academic term codes.");
            }

            if (normalizedTermCodes.Distinct(StringComparer.Ordinal).Count() != normalizedTermCodes.Count)
            {
                throw new CourseRebuildValidationException("A processing window cannot contain duplicate academic term codes.");
            }

            if (normalizedTermCodes.Any(IsMalformedTermCode))
            {
                throw new CourseRebuildValidationException("Processing term codes must be six-digit academic term codes ending in 10, 01, or 03.");
            }

            var years = normalizedTermCodes
                .Select(GetAcademicYearStart)
                .Distinct()
                .OrderBy(y => y)
                .ToList();

            if (years.Count != 2)
            {
                throw new CourseRebuildValidationException("A processing window must contain exactly two academic years.");
            }

            if (years[1] != years[0] + 1)
            {
                throw new CourseRebuildValidationException("The two academic years in a processing window must be contiguous.");
            }

            var requiredTermCodes = GetRequiredTermCodes(years[0], years[1]);
            if (!requiredTermCodes.ToHashSet(StringComparer.Ordinal).SetEquals(normalizedTermCodes))
            {
                throw new CourseRebuildValidationException("A processing window must contain the 10, 01, and 03 terms for each selected academic year.");
            }

            return new CourseProcessingWindow(years[1], requiredTermCodes);
        }

        private static bool IsMalformedTermCode(string academicTermCode)
        {
            return academicTermCode.Length != 6
                || !academicTermCode.All(char.IsDigit)
                || !RequiredTermSuffixes.Contains(academicTermCode.Substring(4, 2));
        }

        private static int GetAcademicYearStart(string academicTermCode)
        {
            var calendarYear = int.Parse(academicTermCode.Substring(0, 4));
            var termSuffix = academicTermCode.Substring(4, 2);

            return termSuffix == "10"
                ? calendarYear
                : calendarYear - 1;
        }

        private static IReadOnlyList<string> GetRequiredTermCodes(int earliestAcademicYear, int mostRecentAcademicYear)
        {
            return new List<string>
            {
                $"{earliestAcademicYear}10",
                $"{earliestAcademicYear + 1}01",
                $"{earliestAcademicYear + 1}03",
                $"{mostRecentAcademicYear}10",
                $"{mostRecentAcademicYear + 1}01",
                $"{mostRecentAcademicYear + 1}03"
            };
        }
    }
}
