using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260522162926_ReorderCourseDescriptionLikeRaw")]
    public partial class ReorderCourseDescriptionLikeRaw : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP TABLE IF EXISTS [dbo].[CourseDescription_Rebuild];

                CREATE TABLE [dbo].[CourseDescription_Rebuild]
                (
                    [Course] [nvarchar](20) NULL,
                    [SubjectCode] [nvarchar](20) NOT NULL,
                    [CourseNumber] [nvarchar](20) NOT NULL,
                    [CrossListing] [nvarchar](200) NULL,
                    [Title] [nvarchar](255) NULL,
                    [AbbreviatedTitle] [nvarchar](100) NULL,
                    [CourseDescription] [nvarchar](max) NULL,
                    [College] [nvarchar](100) NULL,
                    [Department] [nvarchar](200) NULL,
                    [Status] [nvarchar](50) NOT NULL,
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

                INSERT INTO [dbo].[CourseDescription_Rebuild]
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
                FROM [dbo].[CourseDescription];

                DROP TABLE [dbo].[CourseDescription];
                EXEC sp_rename N'[dbo].[CourseDescription_Rebuild]', N'CourseDescription';

                ALTER TABLE [dbo].[CourseDescription]
                ADD CONSTRAINT [PK_CourseDescription] PRIMARY KEY CLUSTERED
                (
                    [SubjectCode] ASC,
                    [CourseNumber] ASC,
                    [Status] ASC
                );
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
