using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    public partial class CourseRebuildResetsSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                RebuildCoursesProcedureSql(RequestResetSql),
                suppressTransaction: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                RebuildCoursesProcedureSql(RequestGuardSql),
                suppressTransaction: true
            );
        }

        private const string RequestResetSql = """
        UPDATE Requests
        SET [CourseNumber] = NewCourses.[Number]
        FROM [dbo].[Requests] Requests
        INNER JOIN #NewCourses NewCourses
            ON UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(NewCourses.[Number])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N'')) = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(Requests.[CourseNumber])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N''));

        UPDATE [dbo].[Requests]
        SET
            [Approved] = NULL,
            [Exception] = 0,
            [ExceptionAnnualizedTaTotal] = 0,
            [ExceptionAnnualizedReaderTotal] = 0,
            [ExceptionAnnualCount] = 0,
            [ExceptionReason] = NULL,
            [ExceptionTaTotal] = 0,
            [ExceptionReaderTotal] = 0,
            [ApprovedComment] = NULL,
            [Submitted] = 0,
            [SubmittedBy] = NULL,
            [SubmittedOn] = NULL;

        UPDATE Requests
        SET [IsActive] = 0
        FROM [dbo].[Requests] Requests
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM #NewCourses NewCourses
            WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(NewCourses.[Number])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N'')) = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(Requests.[CourseNumber])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N''))
        );
        """;

        private const string RequestGuardSql = """
        IF EXISTS
        (
            SELECT 1
            FROM [dbo].[Requests] Requests
            WHERE NOT EXISTS
            (
                SELECT 1
                FROM #NewCourses NewCourses
                WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(NewCourses.[Number])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N'')) = UPPER(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(Requests.[CourseNumber])), N' ', N''), NCHAR(9), N''), NCHAR(10), N''), NCHAR(13), N''))
            )
        )
        BEGIN
            THROW 50007, 'Course list rebuild would remove one or more courses referenced by existing requests. Reset or archive those requests before rebuilding.', 1;
        END;
        """;

        private static string RebuildCoursesProcedureSql(string requestHandlingSql) =>
            $"""
                CREATE OR ALTER PROCEDURE [dbo].[usp_RebuildCoursesFromProcessingWindow]
                    @ProcessingTermCodes [dbo].[AcademicTermCodeList] READONLY
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SET XACT_ABORT ON;

                    IF OBJECT_ID(N'[dbo].[CourseOfferingsRaw]', N'U') IS NULL
                    BEGIN
                        THROW 50000, 'CourseOfferingsRaw source table is required before courses can be rebuilt.', 1;
                    END;

                    IF (SELECT COUNT(*) FROM @ProcessingTermCodes) <> 6
                    BEGIN
                        THROW 50001, 'A processing window must contain exactly six academic term codes.', 1;
                    END;

                    IF EXISTS
                    (
                        SELECT 1
                        FROM @ProcessingTermCodes
                        WHERE [AcademicTermCode] IS NULL
                            OR LEN(LTRIM(RTRIM([AcademicTermCode]))) <> 6
                            OR TRY_CONVERT(int, LEFT(LTRIM(RTRIM([AcademicTermCode])), 4)) IS NULL
                            OR RIGHT(LTRIM(RTRIM([AcademicTermCode])), 2) NOT IN (N'10', N'01', N'03')
                    )
                    BEGIN
                        THROW 50002, 'Processing term codes must be six-digit academic term codes ending in 10, 01, or 03.', 1;
                    END;

                    DECLARE @SelectedTerms TABLE
                    (
                        [AcademicTermCode] nvarchar(6) NOT NULL PRIMARY KEY,
                        [AcademicYearStart] int NOT NULL,
                        [TermSuffix] nvarchar(2) NOT NULL
                    );

                    INSERT INTO @SelectedTerms ([AcademicTermCode], [AcademicYearStart], [TermSuffix])
                    SELECT
                        LTRIM(RTRIM([AcademicTermCode])),
                        CASE
                            WHEN RIGHT(LTRIM(RTRIM([AcademicTermCode])), 2) = N'10'
                                THEN TRY_CONVERT(int, LEFT(LTRIM(RTRIM([AcademicTermCode])), 4))
                            ELSE TRY_CONVERT(int, LEFT(LTRIM(RTRIM([AcademicTermCode])), 4)) - 1
                        END,
                        RIGHT(LTRIM(RTRIM([AcademicTermCode])), 2)
                    FROM @ProcessingTermCodes;

                    IF (SELECT COUNT(DISTINCT [AcademicYearStart]) FROM @SelectedTerms) <> 2
                    BEGIN
                        THROW 50003, 'A processing window must contain exactly two academic years.', 1;
                    END;

                    DECLARE @EarliestAcademicYear int = (SELECT MIN([AcademicYearStart]) FROM @SelectedTerms);
                    DECLARE @MostRecentAcademicYear int = (SELECT MAX([AcademicYearStart]) FROM @SelectedTerms);

                    IF @MostRecentAcademicYear <> @EarliestAcademicYear + 1
                    BEGIN
                        THROW 50004, 'The two academic years in a processing window must be contiguous.', 1;
                    END;

                    DECLARE @RequiredTerms TABLE
                    (
                        [AcademicTermCode] nvarchar(6) NOT NULL PRIMARY KEY
                    );

                    INSERT INTO @RequiredTerms ([AcademicTermCode])
                    VALUES
                        (CONVERT(nvarchar(4), @EarliestAcademicYear) + N'10'),
                        (CONVERT(nvarchar(4), @EarliestAcademicYear + 1) + N'01'),
                        (CONVERT(nvarchar(4), @EarliestAcademicYear + 1) + N'03'),
                        (CONVERT(nvarchar(4), @MostRecentAcademicYear) + N'10'),
                        (CONVERT(nvarchar(4), @MostRecentAcademicYear + 1) + N'01'),
                        (CONVERT(nvarchar(4), @MostRecentAcademicYear + 1) + N'03');

                    IF EXISTS
                    (
                        SELECT [AcademicTermCode] FROM @RequiredTerms
                        EXCEPT
                        SELECT [AcademicTermCode] FROM @SelectedTerms
                    )
                    OR EXISTS
                    (
                        SELECT [AcademicTermCode] FROM @SelectedTerms
                        EXCEPT
                        SELECT [AcademicTermCode] FROM @RequiredTerms
                    )
                    BEGIN
                        THROW 50005, 'A processing window must contain the 10, 01, and 03 terms for each selected academic year.', 1;
                    END;

                    IF EXISTS
                    (
                        SELECT 1
                        FROM @SelectedTerms SelectedTerms
                        LEFT JOIN
                        (
                            SELECT DISTINCT LTRIM(RTRIM([AcademicTermCode])) AS [AcademicTermCode]
                            FROM [dbo].[CourseOfferingsRaw]
                        ) AvailableTerms
                            ON AvailableTerms.[AcademicTermCode] = SelectedTerms.[AcademicTermCode]
                        WHERE AvailableTerms.[AcademicTermCode] IS NULL
                    )
                    BEGIN
                        THROW 50006, 'Every processing term code must already be present in CourseOfferingsRaw.', 1;
                    END;

                    BEGIN TRANSACTION;

                    DECLARE @ExistingCourseCount int;
                    SELECT @ExistingCourseCount = COUNT(*)
                    FROM [dbo].[Courses] WITH (TABLOCKX, HOLDLOCK);

                    CREATE TABLE #ProcessingTerms
                    (
                        [AcademicTermCode] nvarchar(6) NOT NULL PRIMARY KEY,
                        [AcademicYearStart] int NOT NULL,
                        [IsMostRecentAcademicYear] bit NOT NULL
                    );

                    INSERT INTO #ProcessingTerms ([AcademicTermCode], [AcademicYearStart], [IsMostRecentAcademicYear])
                    SELECT
                        [AcademicTermCode],
                        [AcademicYearStart],
                        CASE WHEN [AcademicYearStart] = @MostRecentAcademicYear THEN 1 ELSE 0 END
                    FROM @SelectedTerms;

                    CREATE TABLE #Offerings
                    (
                        [AcademicTermCode] nvarchar(6) NOT NULL,
                        [AcademicYearStart] int NOT NULL,
                        [IsMostRecentAcademicYear] bit NOT NULL,
                        [SubjectCode] nvarchar(20) NOT NULL,
                        [CourseNumber] nvarchar(20) NOT NULL,
                        [Number] nvarchar(450) NOT NULL,
                        [CourseName] nvarchar(255) NULL,
                        [DeptName] nvarchar(100) NULL,
                        [Enrollment] int NOT NULL,
                        [NumCreditSections] int NOT NULL,
                        [NumNonCreditSections] int NOT NULL
                    );

                    INSERT INTO #Offerings
                    (
                        [AcademicTermCode],
                        [AcademicYearStart],
                        [IsMostRecentAcademicYear],
                        [SubjectCode],
                        [CourseNumber],
                        [Number],
                        [CourseName],
                        [DeptName],
                        [Enrollment],
                        [NumCreditSections],
                        [NumNonCreditSections]
                    )
                    SELECT
                        LTRIM(RTRIM(SourceOfferings.[AcademicTermCode])),
                        ProcessingTerms.[AcademicYearStart],
                        ProcessingTerms.[IsMostRecentAcademicYear],
                        UPPER(LTRIM(RTRIM(SourceOfferings.[SubjectCode]))),
                        UPPER(REPLACE(LTRIM(RTRIM(SourceOfferings.[CourseNumber])), N' ', N'')),
                        UPPER(LTRIM(RTRIM(SourceOfferings.[SubjectCode]))) + UPPER(REPLACE(LTRIM(RTRIM(SourceOfferings.[CourseNumber])), N' ', N'')),
                        NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(255), SourceOfferings.[CourseName]))), N''),
                        NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(100), SourceOfferings.[DeptName]))), N''),
                        COALESCE(SourceOfferings.[Enrollment], 0),
                        COALESCE(SourceOfferings.[NumCreditSections], 0),
                        COALESCE(SourceOfferings.[NumNonCreditSections], 0)
                    FROM [dbo].[CourseOfferingsRaw] SourceOfferings
                    INNER JOIN #ProcessingTerms ProcessingTerms
                        ON ProcessingTerms.[AcademicTermCode] = LTRIM(RTRIM(SourceOfferings.[AcademicTermCode]))
                    WHERE SourceOfferings.[SubjectCode] IS NOT NULL
                        AND SourceOfferings.[CourseNumber] IS NOT NULL
                        AND LTRIM(RTRIM(SourceOfferings.[SubjectCode])) <> N''
                        AND LTRIM(RTRIM(SourceOfferings.[CourseNumber])) <> N'';

                    CREATE TABLE #ActiveCatalog
                    (
                        [CourseKey] nvarchar(450) NOT NULL PRIMARY KEY,
                        [Title] nvarchar(255) NULL,
                        [Department] nvarchar(100) NULL,
                        [CrossListing] nvarchar(200) NULL
                    );

                    ;WITH NormalizedCatalog AS
                    (
                        SELECT
                            UPPER(REPLACE(LTRIM(RTRIM(COALESCE(NULLIF([Course], N''), COALESCE([SubjectCode], N'') + COALESCE([CourseNumber], N'')))), N' ', N'')) AS [CourseKey],
                            NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(255), [Title]))), N'') AS [Title],
                            NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(100), [Department]))), N'') AS [Department],
                            NULLIF(LTRIM(RTRIM(CONVERT(nvarchar(200), [CrossListing]))), N'') AS [CrossListing],
                            TRY_CONVERT(datetime2, [UpdatedOn]) AS [UpdatedOnDate],
                            TRY_CONVERT(datetime2, [CreatedOn]) AS [CreatedOnDate]
                        FROM [dbo].[CourseDescription]
                        WHERE UPPER(LTRIM(RTRIM(COALESCE([Status], N'')))) = N'ACTIVE'
                    ),
                    RankedCatalog AS
                    (
                        SELECT
                            [CourseKey],
                            [Title],
                            [Department],
                            [CrossListing],
                            ROW_NUMBER() OVER
                            (
                                PARTITION BY [CourseKey]
                                ORDER BY [UpdatedOnDate] DESC, [CreatedOnDate] DESC, [Title]
                            ) AS [RowNumber]
                        FROM NormalizedCatalog
                        WHERE [CourseKey] <> N''
                    )
                    INSERT INTO #ActiveCatalog ([CourseKey], [Title], [Department], [CrossListing])
                    SELECT [CourseKey], [Title], [Department], [CrossListing]
                    FROM RankedCatalog
                    WHERE [RowNumber] = 1;

                    CREATE TABLE #OfferedCourses
                    (
                        [Number] nvarchar(450) NOT NULL PRIMARY KEY,
                        [CourseName] nvarchar(255) NULL,
                        [DeptName] nvarchar(100) NULL,
                        [NonCrossListedAverageEnrollment] float NOT NULL,
                        [AverageSectionsPerCourse] float NOT NULL,
                        [TimesOfferedPerYear] float NOT NULL,
                        [WasCourseTaughtInMostRecentYear] bit NOT NULL,
                        [IsCourseTaughtOnceEveryTwoYears] bit NOT NULL
                    );

                    ;WITH OfferingTotals AS
                    (
                        SELECT
                            [Number],
                            SUM(CONVERT(float, [Enrollment])) AS [Enrollment],
                            SUM(CONVERT(float, [NumCreditSections])) AS [CreditSections],
                            SUM(CONVERT(float, [NumNonCreditSections])) AS [NonCreditSections],
                            MAX(CASE WHEN [IsMostRecentAcademicYear] = 1 THEN 1 ELSE 0 END) AS [WasCourseTaughtInMostRecentYear],
                            COUNT(DISTINCT [AcademicYearStart]) AS [AcademicYearsOffered]
                        FROM #Offerings
                        GROUP BY [Number]
                        HAVING SUM([NumCreditSections]) > 0
                    )
                    INSERT INTO #OfferedCourses
                    (
                        [Number],
                        [CourseName],
                        [DeptName],
                        [NonCrossListedAverageEnrollment],
                        [AverageSectionsPerCourse],
                        [TimesOfferedPerYear],
                        [WasCourseTaughtInMostRecentYear],
                        [IsCourseTaughtOnceEveryTwoYears]
                    )
                    SELECT
                        OfferingTotals.[Number],
                        LatestOffering.[CourseName],
                        LatestOffering.[DeptName],
                        OfferingTotals.[Enrollment] / OfferingTotals.[CreditSections],
                        OfferingTotals.[NonCreditSections] / OfferingTotals.[CreditSections],
                        OfferingTotals.[CreditSections] / 2.0,
                        CAST(OfferingTotals.[WasCourseTaughtInMostRecentYear] AS bit),
                        CAST(CASE WHEN OfferingTotals.[AcademicYearsOffered] = 1 THEN 1 ELSE 0 END AS bit)
                    FROM OfferingTotals
                    OUTER APPLY
                    (
                        SELECT TOP (1)
                            Offerings.[CourseName],
                            Offerings.[DeptName]
                        FROM #Offerings Offerings
                        WHERE Offerings.[Number] = OfferingTotals.[Number]
                        ORDER BY Offerings.[AcademicTermCode] DESC
                    ) LatestOffering;

                    CREATE TABLE #NewCourses
                    (
                        [Number] nvarchar(450) NOT NULL PRIMARY KEY,
                        [Name] nvarchar(255) NULL,
                        [DeptName] nvarchar(100) NULL,
                        [NonCrossListedAverageEnrollment] float NOT NULL,
                        [AverageEnrollment] float NOT NULL,
                        [AverageSectionsPerCourse] float NOT NULL,
                        [TimesOfferedPerYear] float NOT NULL,
                        [IsCrossListed] bit NOT NULL,
                        [CrossListingsString] nvarchar(200) NULL,
                        [IsOfferedWithinPastTwoYears] bit NOT NULL,
                        [WasCourseTaughtInMostRecentYear] bit NOT NULL,
                        [IsCourseTaughtOnceEveryTwoYears] bit NOT NULL
                    );

                    INSERT INTO #NewCourses
                    (
                        [Number],
                        [Name],
                        [DeptName],
                        [NonCrossListedAverageEnrollment],
                        [AverageEnrollment],
                        [AverageSectionsPerCourse],
                        [TimesOfferedPerYear],
                        [IsCrossListed],
                        [CrossListingsString],
                        [IsOfferedWithinPastTwoYears],
                        [WasCourseTaughtInMostRecentYear],
                        [IsCourseTaughtOnceEveryTwoYears]
                    )
                    SELECT
                        OfferedCourses.[Number],
                        COALESCE(ActiveCatalog.[Title], OfferedCourses.[CourseName], OfferedCourses.[Number]),
                        COALESCE(ActiveCatalog.[Department], OfferedCourses.[DeptName]),
                        OfferedCourses.[NonCrossListedAverageEnrollment],
                        OfferedCourses.[NonCrossListedAverageEnrollment],
                        OfferedCourses.[AverageSectionsPerCourse],
                        OfferedCourses.[TimesOfferedPerYear],
                        0,
                        NULL,
                        1,
                        OfferedCourses.[WasCourseTaughtInMostRecentYear],
                        OfferedCourses.[IsCourseTaughtOnceEveryTwoYears]
                    FROM #OfferedCourses OfferedCourses
                    LEFT JOIN #ActiveCatalog ActiveCatalog
                        ON ActiveCatalog.[CourseKey] = OfferedCourses.[Number];

                    INSERT INTO #NewCourses
                    (
                        [Number],
                        [Name],
                        [DeptName],
                        [NonCrossListedAverageEnrollment],
                        [AverageEnrollment],
                        [AverageSectionsPerCourse],
                        [TimesOfferedPerYear],
                        [IsCrossListed],
                        [CrossListingsString],
                        [IsOfferedWithinPastTwoYears],
                        [WasCourseTaughtInMostRecentYear],
                        [IsCourseTaughtOnceEveryTwoYears]
                    )
                    SELECT
                        ActiveCatalog.[CourseKey],
                        COALESCE(ActiveCatalog.[Title], ActiveCatalog.[CourseKey]),
                        ActiveCatalog.[Department],
                        0,
                        0,
                        0,
                        0,
                        0,
                        NULL,
                        0,
                        0,
                        0
                    FROM #ActiveCatalog ActiveCatalog
                    WHERE NOT EXISTS
                    (
                        SELECT 1
                        FROM #NewCourses NewCourses
                        WHERE NewCourses.[Number] = ActiveCatalog.[CourseKey]
                    );

                    CREATE TABLE #CrossListingMembers
                    (
                        [CourseKey] nvarchar(450) NOT NULL,
                        [MemberKey] nvarchar(450) NOT NULL,
                        [CrossListingsString] nvarchar(200) NULL
                    );

                    INSERT INTO #CrossListingMembers ([CourseKey], [MemberKey], [CrossListingsString])
                    SELECT
                        ActiveCatalog.[CourseKey],
                        ParsedCourses.[CourseNumber],
                        ActiveCatalog.[CrossListing]
                    FROM #ActiveCatalog ActiveCatalog
                    CROSS APPLY [dbo].[udf_ParseCrossListedCourseNumbers](ActiveCatalog.[CourseKey], ActiveCatalog.[CrossListing]) ParsedCourses
                    WHERE ActiveCatalog.[CrossListing] IS NOT NULL;

                    CREATE TABLE #CrossListingGroups
                    (
                        [CourseKey] nvarchar(450) NOT NULL PRIMARY KEY,
                        [GroupKey] nvarchar(450) NOT NULL,
                        [CrossListingsString] nvarchar(200) NULL
                    );

                    INSERT INTO #CrossListingGroups ([CourseKey], [GroupKey], [CrossListingsString])
                    SELECT
                        [CourseKey],
                        MIN([MemberKey]) AS [GroupKey],
                        MAX([CrossListingsString]) AS [CrossListingsString]
                    FROM #CrossListingMembers
                    GROUP BY [CourseKey];

                    ;WITH GroupMembers AS
                    (
                        SELECT DISTINCT
                            CrossListingGroups.[GroupKey],
                            CrossListingMembers.[MemberKey]
                        FROM #CrossListingGroups CrossListingGroups
                        INNER JOIN #CrossListingMembers CrossListingMembers
                            ON CrossListingMembers.[CourseKey] = CrossListingGroups.[CourseKey]
                    ),
                    GroupEnrollment AS
                    (
                        SELECT
                            GroupMembers.[GroupKey],
                            SUM(NewCourses.[NonCrossListedAverageEnrollment]) AS [CombinedAverageEnrollment]
                        FROM GroupMembers
                        INNER JOIN #NewCourses NewCourses
                            ON NewCourses.[Number] = GroupMembers.[MemberKey]
                        GROUP BY GroupMembers.[GroupKey]
                    )
                    UPDATE NewCourses
                    SET
                        [IsCrossListed] = 1,
                        [CrossListingsString] = LEFT(CrossListingGroups.[CrossListingsString], 200),
                        [AverageEnrollment] = COALESCE(GroupEnrollment.[CombinedAverageEnrollment], NewCourses.[AverageEnrollment])
                    FROM #NewCourses NewCourses
                    INNER JOIN #CrossListingGroups CrossListingGroups
                        ON CrossListingGroups.[CourseKey] = NewCourses.[Number]
                    LEFT JOIN GroupEnrollment
                        ON GroupEnrollment.[GroupKey] = CrossListingGroups.[GroupKey];

                {requestHandlingSql}
                    UPDATE ExistingCourses
                    SET
                        [Name] = NewCourses.[Name],
                        [DeptName] = NewCourses.[DeptName],
                        [NonCrossListedAverageEnrollment] = NewCourses.[NonCrossListedAverageEnrollment],
                        [AverageEnrollment] = NewCourses.[AverageEnrollment],
                        [AverageSectionsPerCourse] = NewCourses.[AverageSectionsPerCourse],
                        [TimesOfferedPerYear] = NewCourses.[TimesOfferedPerYear],
                        [IsCrossListed] = NewCourses.[IsCrossListed],
                        [CrossListingsString] = NewCourses.[CrossListingsString],
                        [IsOfferedWithinPastTwoYears] = NewCourses.[IsOfferedWithinPastTwoYears],
                        [WasCourseTaughtInMostRecentYear] = NewCourses.[WasCourseTaughtInMostRecentYear],
                        [IsCourseTaughtOnceEveryTwoYears] = NewCourses.[IsCourseTaughtOnceEveryTwoYears]
                    FROM [dbo].[Courses] ExistingCourses
                    INNER JOIN #NewCourses NewCourses
                        ON NewCourses.[Number] = ExistingCourses.[Number];

                    INSERT INTO [dbo].[Courses]
                    (
                        [Number],
                        [Name],
                        [DeptName],
                        [NonCrossListedAverageEnrollment],
                        [AverageEnrollment],
                        [AverageSectionsPerCourse],
                        [TimesOfferedPerYear],
                        [IsCrossListed],
                        [CrossListingsString],
                        [IsOfferedWithinPastTwoYears],
                        [WasCourseTaughtInMostRecentYear],
                        [IsCourseTaughtOnceEveryTwoYears]
                    )
                    SELECT
                        NewCourses.[Number],
                        NewCourses.[Name],
                        NewCourses.[DeptName],
                        NewCourses.[NonCrossListedAverageEnrollment],
                        NewCourses.[AverageEnrollment],
                        NewCourses.[AverageSectionsPerCourse],
                        NewCourses.[TimesOfferedPerYear],
                        NewCourses.[IsCrossListed],
                        NewCourses.[CrossListingsString],
                        NewCourses.[IsOfferedWithinPastTwoYears],
                        NewCourses.[WasCourseTaughtInMostRecentYear],
                        NewCourses.[IsCourseTaughtOnceEveryTwoYears]
                    FROM #NewCourses NewCourses
                    WHERE NOT EXISTS
                    (
                        SELECT 1
                        FROM [dbo].[Courses] ExistingCourses
                        WHERE ExistingCourses.[Number] = NewCourses.[Number]
                    );

                DELETE ExistingCourses
                FROM [dbo].[Courses] ExistingCourses
                WHERE NOT EXISTS
                (
                    SELECT 1
                    FROM #NewCourses NewCourses
                    WHERE NewCourses.[Number] = ExistingCourses.[Number]
                );
                    COMMIT TRANSACTION;
                END;
            """;
    }
}
