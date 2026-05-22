using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260522155158_CreateCourseDescriptionRaw")]
    public partial class CreateCourseDescriptionRaw : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[CourseDescriptionRaw]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[CourseDescriptionRaw]
                    (
                        [Course] [nvarchar](20) NULL,
                        [SubjectCode] [nvarchar](20) NULL,
                        [CourseNumber] [nvarchar](20) NULL,
                        [CrossListing] [nvarchar](200) NULL,
                        [Title] [nvarchar](255) NULL,
                        [AbbreviatedTitle] [nvarchar](100) NULL,
                        [CourseDescription] [nvarchar](max) NULL,
                        [College] [nvarchar](100) NULL,
                        [Department] [nvarchar](200) NULL,
                        [Status] [nvarchar](50) NULL,
                        [CreatedOn] [datetime2](6) NULL,
                        [UpdatedOn] [datetime2](6) NULL,
                        [FirstLearningActivity] [nvarchar](100) NULL,
                        [FirstContactHoursPeriod] [nvarchar](50) NULL,
                        [SecondLearningActivity] [nvarchar](100) NULL,
                        [SecondContactHoursPeriod] [nvarchar](50) NULL,
                        [ThirdLearningActivity] [nvarchar](100) NULL,
                        [ThirdContactHoursPeriod] [nvarchar](50) NULL,
                        [FourthLearningActivity] [nvarchar](100) NULL,
                        [FourthContactHoursPeriod] [nvarchar](50) NULL,
                        [Ge2ArtsHumanities] [nvarchar](100) NULL,
                        [Ge2ScienceEngineering] [nvarchar](100) NULL,
                        [Ge2SocialSciences] [nvarchar](100) NULL,
                        [Ge2Diversity] [nvarchar](100) NULL,
                        [Ge2WritingExperience] [nvarchar](100) NULL,
                        [Ge3ArtsHumanities] [nvarchar](100) NULL,
                        [Ge3ScienceEngineering] [nvarchar](100) NULL,
                        [Ge3SocialSciences] [nvarchar](100) NULL,
                        [Ge3AmericanCultures] [nvarchar](100) NULL,
                        [Ge3DomesticDiversity] [nvarchar](100) NULL,
                        [Ge3OralLiteracy] [nvarchar](100) NULL,
                        [Ge3QuantitativeLiteracy] [nvarchar](100) NULL,
                        [Ge3ScientificLiteracy] [nvarchar](100) NULL,
                        [Ge3VisualLiteracy] [nvarchar](100) NULL,
                        [Ge3WorldCultures] [nvarchar](100) NULL,
                        [Ge3WritingExperience] [nvarchar](100) NULL,
                        [Quarters] [nvarchar](300) NULL,
                        [QuartersOffered] [nvarchar](100) NULL,
                        [EffectiveTerm] [nvarchar](6) NULL,
                        [Effective] [nvarchar](100) NULL
                    );
                END;

                IF OBJECT_ID(N'[dbo].[CourseDescriptionRaw]', N'U') IS NOT NULL
                    AND NOT EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CourseDescriptionRaw]')
                            AND name = N'IX_CourseDescriptionRaw_Course_Status'
                    )
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_CourseDescriptionRaw_Course_Status]
                    ON [dbo].[CourseDescriptionRaw] ([Course], [Status]);
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
                IF OBJECT_ID(N'[dbo].[CourseDescriptionRaw]', N'U') IS NOT NULL
                    AND EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CourseDescriptionRaw]')
                            AND name = N'IX_CourseDescriptionRaw_Course_Status'
                    )
                BEGIN
                    DROP INDEX [IX_CourseDescriptionRaw_Course_Status]
                    ON [dbo].[CourseDescriptionRaw];
                END;

                DROP TABLE IF EXISTS [dbo].[CourseDescriptionRaw];
                """,
                suppressTransaction: true
            );
        }
    }
}
