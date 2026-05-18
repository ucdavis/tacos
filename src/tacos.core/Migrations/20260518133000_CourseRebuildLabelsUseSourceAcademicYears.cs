using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260518133000_CourseRebuildLabelsUseSourceAcademicYears")]
    public partial class CourseRebuildLabelsUseSourceAcademicYears : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR ALTER PROCEDURE [dbo].[usp_GetCourseRebuildAcademicYearSpanOptions]
                AS
                BEGIN
                    SET NOCOUNT ON;

                    IF OBJECT_ID(N'[dbo].[CourseOfferingsRaw]', N'U') IS NULL
                    BEGIN
                        THROW 50000, 'CourseOfferingsRaw source table is required before course rebuild options can be listed.', 1;
                    END;

                    ;WITH AvailableTermCodes AS
                    (
                        SELECT DISTINCT
                            LTRIM(RTRIM([AcademicTermCode])) AS [AcademicTermCode],
                            NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(20), [AcademicYear]))), N'') AS [AcademicYear]
                        FROM [dbo].[CourseOfferingsRaw]
                        WHERE [AcademicTermCode] IS NOT NULL
                            AND LEN(LTRIM(RTRIM([AcademicTermCode]))) = 6
                            AND TRY_CONVERT(int, LEFT(LTRIM(RTRIM([AcademicTermCode])), 4)) IS NOT NULL
                            AND RIGHT(LTRIM(RTRIM([AcademicTermCode])), 2) IN (N'10', N'01', N'03')
                    ),
                    AvailableAcademicYears AS
                    (
                        SELECT DISTINCT
                            CASE
                                WHEN RIGHT([AcademicTermCode], 2) = N'10'
                                    THEN TRY_CONVERT(int, LEFT([AcademicTermCode], 4))
                                ELSE TRY_CONVERT(int, LEFT([AcademicTermCode], 4)) - 1
                            END AS [AcademicYearStart]
                        FROM AvailableTermCodes
                    ),
                    RequiredTerms AS
                    (
                        SELECT
                            AcademicYears.[AcademicYearStart] AS [LaterAcademicYearStart],
                            TermValues.[TermOrder],
                            TermValues.[AcademicTermCode]
                        FROM AvailableAcademicYears AcademicYears
                        CROSS APPLY
                        (
                            VALUES
                                (1, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] - 1) + N'10'),
                                (2, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'01'),
                                (3, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'03'),
                                (4, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'10'),
                                (5, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] + 1) + N'01'),
                                (6, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] + 1) + N'03')
                        ) TermValues([TermOrder], [AcademicTermCode])
                    ),
                    RequiredTermsWithAvailability AS
                    (
                        SELECT
                            RequiredTerms.[LaterAcademicYearStart],
                            RequiredTerms.[TermOrder],
                            RequiredTerms.[AcademicTermCode],
                            SourceYears.[AcademicYear],
                            CASE
                                WHEN SourceYears.[AcademicTermCode] IS NULL THEN 0
                                ELSE 1
                            END AS [IsAvailable]
                        FROM RequiredTerms
                        OUTER APPLY
                        (
                            SELECT TOP (1)
                                AvailableTermCodes.[AcademicTermCode],
                                AvailableTermCodes.[AcademicYear]
                            FROM AvailableTermCodes
                            WHERE AvailableTermCodes.[AcademicTermCode] = RequiredTerms.[AcademicTermCode]
                            ORDER BY AvailableTermCodes.[AcademicYear]
                        ) SourceYears
                    ),
                    AcademicYearLabels AS
                    (
                        SELECT
                            LabelTerms.[LaterAcademicYearStart],
                            STUFF(
                                (
                                    SELECT N' and ' + LabelYears.[AcademicYear]
                                    FROM
                                    (
                                        SELECT DISTINCT
                                            [LaterAcademicYearStart],
                                            [AcademicYear]
                                        FROM RequiredTermsWithAvailability
                                        WHERE [AcademicYear] IS NOT NULL
                                    ) LabelYears
                                    WHERE LabelYears.[LaterAcademicYearStart] = LabelTerms.[LaterAcademicYearStart]
                                    ORDER BY LabelYears.[AcademicYear]
                                    FOR XML PATH(N''), TYPE
                                ).value(N'.', N'nvarchar(max)'),
                                1,
                                5,
                                N''
                            ) AS [AcademicYearSpan]
                        FROM RequiredTermsWithAvailability LabelTerms
                        GROUP BY LabelTerms.[LaterAcademicYearStart]
                    )
                    SELECT
                        COALESCE(
                            AcademicYearLabels.[AcademicYearSpan],
                            CONVERT(nvarchar(4), RequiredTermsWithAvailability.[LaterAcademicYearStart]) + N'-' + RIGHT(CONVERT(nvarchar(4), RequiredTermsWithAvailability.[LaterAcademicYearStart] + 1), 2)
                        ) AS [AcademicYearSpan],
                        RequiredTermsWithAvailability.[LaterAcademicYearStart] AS [StartingAcademicYear],
                        RequiredTermsWithAvailability.[AcademicTermCode],
                        RequiredTermsWithAvailability.[TermOrder],
                        CAST(RequiredTermsWithAvailability.[IsAvailable] AS bit) AS [IsAvailable],
                        CAST(MIN(RequiredTermsWithAvailability.[IsAvailable]) OVER (PARTITION BY RequiredTermsWithAvailability.[LaterAcademicYearStart]) AS bit) AS [IsComplete]
                    FROM RequiredTermsWithAvailability
                    LEFT JOIN AcademicYearLabels
                        ON AcademicYearLabels.[LaterAcademicYearStart] = RequiredTermsWithAvailability.[LaterAcademicYearStart]
                    ORDER BY RequiredTermsWithAvailability.[LaterAcademicYearStart] DESC, RequiredTermsWithAvailability.[TermOrder];
                END;
                """,
                suppressTransaction: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR ALTER PROCEDURE [dbo].[usp_GetCourseRebuildAcademicYearSpanOptions]
                AS
                BEGIN
                    SET NOCOUNT ON;

                    IF OBJECT_ID(N'[dbo].[CourseOfferingsRaw]', N'U') IS NULL
                    BEGIN
                        THROW 50000, 'CourseOfferingsRaw source table is required before course rebuild options can be listed.', 1;
                    END;

                    ;WITH AvailableTermCodes AS
                    (
                        SELECT DISTINCT LTRIM(RTRIM([AcademicTermCode])) AS [AcademicTermCode]
                        FROM [dbo].[CourseOfferingsRaw]
                        WHERE [AcademicTermCode] IS NOT NULL
                            AND LEN(LTRIM(RTRIM([AcademicTermCode]))) = 6
                            AND TRY_CONVERT(int, LEFT(LTRIM(RTRIM([AcademicTermCode])), 4)) IS NOT NULL
                            AND RIGHT(LTRIM(RTRIM([AcademicTermCode])), 2) IN (N'10', N'01', N'03')
                    ),
                    AvailableAcademicYears AS
                    (
                        SELECT DISTINCT
                            CASE
                                WHEN RIGHT([AcademicTermCode], 2) = N'10'
                                    THEN TRY_CONVERT(int, LEFT([AcademicTermCode], 4))
                                ELSE TRY_CONVERT(int, LEFT([AcademicTermCode], 4)) - 1
                            END AS [AcademicYearStart]
                        FROM AvailableTermCodes
                    ),
                    RequiredTerms AS
                    (
                        SELECT
                            AcademicYears.[AcademicYearStart] AS [LaterAcademicYearStart],
                            TermValues.[TermOrder],
                            TermValues.[AcademicTermCode]
                        FROM AvailableAcademicYears AcademicYears
                        CROSS APPLY
                        (
                            VALUES
                                (1, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] - 1) + N'10'),
                                (2, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'01'),
                                (3, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'03'),
                                (4, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart]) + N'10'),
                                (5, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] + 1) + N'01'),
                                (6, CONVERT(nvarchar(4), AcademicYears.[AcademicYearStart] + 1) + N'03')
                        ) TermValues([TermOrder], [AcademicTermCode])
                    ),
                    RequiredTermsWithAvailability AS
                    (
                        SELECT
                            RequiredTerms.[LaterAcademicYearStart],
                            RequiredTerms.[TermOrder],
                            RequiredTerms.[AcademicTermCode],
                            CASE
                                WHEN AvailableTermCodes.[AcademicTermCode] IS NULL THEN 0
                                ELSE 1
                            END AS [IsAvailable]
                        FROM RequiredTerms
                        LEFT JOIN AvailableTermCodes
                            ON AvailableTermCodes.[AcademicTermCode] = RequiredTerms.[AcademicTermCode]
                    )
                    SELECT
                        CONVERT(nvarchar(4), [LaterAcademicYearStart]) + N'-' + RIGHT(CONVERT(nvarchar(4), [LaterAcademicYearStart] + 1), 2) AS [AcademicYearSpan],
                        [LaterAcademicYearStart] AS [StartingAcademicYear],
                        [AcademicTermCode],
                        [TermOrder],
                        CAST([IsAvailable] AS bit) AS [IsAvailable],
                        CAST(MIN([IsAvailable]) OVER (PARTITION BY [LaterAcademicYearStart]) AS bit) AS [IsComplete]
                    FROM RequiredTermsWithAvailability
                    ORDER BY [LaterAcademicYearStart] DESC, [TermOrder];
                END;
                """,
                suppressTransaction: true
            );
        }
    }
}
