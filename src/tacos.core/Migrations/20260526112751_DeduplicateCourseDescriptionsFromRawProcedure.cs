using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260526112751_DeduplicateCourseDescriptionsFromRawProcedure")]
    public partial class DeduplicateCourseDescriptionsFromRawProcedure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR ALTER PROCEDURE [dbo].[usp_ReplaceCourseDescriptionsFromRaw]
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SET XACT_ABORT ON;

                    IF OBJECT_ID(N'[dbo].[CourseDescriptionRaw]', N'U') IS NULL
                    BEGIN
                        THROW 50012, 'CourseDescriptionRaw source table is required before course descriptions can be replaced.', 1;
                    END;

                    IF EXISTS
                    (
                        SELECT 1
                        FROM [dbo].[CourseDescriptionRaw]
                        WHERE [SubjectCode] IS NULL
                            OR [CourseNumber] IS NULL
                            OR [Status] IS NULL
                    )
                    BEGIN
                        THROW 50013, 'CourseDescriptionRaw contains rows without a CourseDescription primary key.', 1;
                    END;

                    BEGIN TRANSACTION;

                    DELETE FROM [dbo].[CourseDescription];

                    ;WITH RankedCourseDescriptions AS
                    (
                        SELECT
                            [Course],
                            [SubjectCode],
                            [CourseNumber],
                            [CrossListing],
                            [Title],
                            [AbbreviatedTitle],
                            [CourseDescription],
                            [College],
                            [Department],
                            [Status],
                            [CreatedOn],
                            [UpdatedOn],
                            [FirstLearningActivity],
                            [FirstContactHoursPeriod],
                            [SecondLearningActivity],
                            [SecondContactHoursPeriod],
                            [ThirdLearningActivity],
                            [ThirdContactHoursPeriod],
                            [FourthLearningActivity],
                            [FourthContactHoursPeriod],
                            [Ge2ArtsHumanities],
                            [Ge2ScienceEngineering],
                            [Ge2SocialSciences],
                            [Ge2Diversity],
                            [Ge2WritingExperience],
                            [Ge3ArtsHumanities],
                            [Ge3ScienceEngineering],
                            [Ge3SocialSciences],
                            [Ge3AmericanCultures],
                            [Ge3DomesticDiversity],
                            [Ge3OralLiteracy],
                            [Ge3QuantitativeLiteracy],
                            [Ge3ScientificLiteracy],
                            [Ge3VisualLiteracy],
                            [Ge3WorldCultures],
                            [Ge3WritingExperience],
                            [Quarters],
                            [QuartersOffered],
                            [EffectiveTerm],
                            [Effective],
                            ROW_NUMBER() OVER
                            (
                                PARTITION BY [SubjectCode], [CourseNumber], [Status]
                                ORDER BY [UpdatedOn] DESC, [CreatedOn] DESC, TRY_CONVERT(int, [EffectiveTerm]) DESC, [Course]
                            ) AS [RowNumber]
                        FROM [dbo].[CourseDescriptionRaw]
                    )
                    INSERT INTO [dbo].[CourseDescription]
                    (
                        [Course],
                        [SubjectCode],
                        [CourseNumber],
                        [CrossListing],
                        [Title],
                        [AbbreviatedTitle],
                        [CourseDescription],
                        [College],
                        [Department],
                        [Status],
                        [CreatedOn],
                        [UpdatedOn],
                        [FirstLearningActivity],
                        [FirstContactHoursPeriod],
                        [SecondLearningActivity],
                        [SecondContactHoursPeriod],
                        [ThirdLearningActivity],
                        [ThirdContactHoursPeriod],
                        [FourthLearningActivity],
                        [FourthContactHoursPeriod],
                        [Ge2ArtsHumanities],
                        [Ge2ScienceEngineering],
                        [Ge2SocialSciences],
                        [Ge2Diversity],
                        [Ge2WritingExperience],
                        [Ge3ArtsHumanities],
                        [Ge3ScienceEngineering],
                        [Ge3SocialSciences],
                        [Ge3AmericanCultures],
                        [Ge3DomesticDiversity],
                        [Ge3OralLiteracy],
                        [Ge3QuantitativeLiteracy],
                        [Ge3ScientificLiteracy],
                        [Ge3VisualLiteracy],
                        [Ge3WorldCultures],
                        [Ge3WritingExperience],
                        [Quarters],
                        [QuartersOffered],
                        [EffectiveTerm],
                        [Effective]
                    )
                    SELECT
                        [Course],
                        [SubjectCode],
                        [CourseNumber],
                        [CrossListing],
                        [Title],
                        [AbbreviatedTitle],
                        [CourseDescription],
                        [College],
                        [Department],
                        [Status],
                        [CreatedOn],
                        [UpdatedOn],
                        [FirstLearningActivity],
                        [FirstContactHoursPeriod],
                        [SecondLearningActivity],
                        [SecondContactHoursPeriod],
                        [ThirdLearningActivity],
                        [ThirdContactHoursPeriod],
                        [FourthLearningActivity],
                        [FourthContactHoursPeriod],
                        [Ge2ArtsHumanities],
                        [Ge2ScienceEngineering],
                        [Ge2SocialSciences],
                        [Ge2Diversity],
                        [Ge2WritingExperience],
                        [Ge3ArtsHumanities],
                        [Ge3ScienceEngineering],
                        [Ge3SocialSciences],
                        [Ge3AmericanCultures],
                        [Ge3DomesticDiversity],
                        [Ge3OralLiteracy],
                        [Ge3QuantitativeLiteracy],
                        [Ge3ScientificLiteracy],
                        [Ge3VisualLiteracy],
                        [Ge3WorldCultures],
                        [Ge3WritingExperience],
                        [Quarters],
                        [QuartersOffered],
                        [EffectiveTerm],
                        [Effective]
                    FROM RankedCourseDescriptions
                    WHERE [RowNumber] = 1;

                    COMMIT TRANSACTION;
                END;
                """,
                suppressTransaction: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
