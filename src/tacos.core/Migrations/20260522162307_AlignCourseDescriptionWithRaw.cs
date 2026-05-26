using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260522162307_AlignCourseDescriptionWithRaw")]
    public partial class AlignCourseDescriptionWithRaw : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'FirstContactHoursPeriod') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [FirstContactHoursPeriod] [nvarchar](50) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'SecondContactHoursPeriod') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [SecondContactHoursPeriod] [nvarchar](50) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'ThirdContactHoursPeriod') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [ThirdContactHoursPeriod] [nvarchar](50) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'FourthContactHoursPeriod') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [FourthContactHoursPeriod] [nvarchar](50) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge2ArtsHumanities') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge2ArtsHumanities] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge2ScienceEngineering') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge2ScienceEngineering] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge2SocialSciences') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge2SocialSciences] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge2Diversity') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge2Diversity] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge2WritingExperience') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge2WritingExperience] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3ArtsHumanities') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3ArtsHumanities] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3ScienceEngineering') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3ScienceEngineering] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3SocialSciences') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3SocialSciences] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3AmericanCultures') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3AmericanCultures] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3DomesticDiversity') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3DomesticDiversity] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3OralLiteracy') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3OralLiteracy] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3QuantitativeLiteracy') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3QuantitativeLiteracy] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3ScientificLiteracy') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3ScientificLiteracy] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3VisualLiteracy') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3VisualLiteracy] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3WorldCultures') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3WorldCultures] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'Ge3WritingExperience') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [Ge3WritingExperience] [nvarchar](100) NULL;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                DECLARE @PrimaryKeyName sysname;

                SELECT @PrimaryKeyName = [name]
                FROM sys.key_constraints
                WHERE [parent_object_id] = OBJECT_ID(N'[dbo].[CourseDescription]')
                    AND [type] = N'PK';

                IF @PrimaryKeyName IS NOT NULL
                BEGIN
                    EXEC(N'ALTER TABLE [dbo].[CourseDescription] DROP CONSTRAINT [' + @PrimaryKeyName + N'];');
                END;

                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [Course] [nvarchar](20) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [SubjectCode] [nvarchar](20) NOT NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [CourseNumber] [nvarchar](20) NOT NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [CrossListing] [nvarchar](200) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [Title] [nvarchar](255) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [CourseDescription] [nvarchar](max) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [Department] [nvarchar](200) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [QuartersOffered] [nvarchar](100) NULL;
                ALTER TABLE [dbo].[CourseDescription] ALTER COLUMN [Effective] [nvarchar](100) NULL;

                IF @PrimaryKeyName IS NOT NULL
                BEGIN
                    ALTER TABLE [dbo].[CourseDescription]
                    ADD CONSTRAINT [PK_CourseDescription] PRIMARY KEY CLUSTERED
                    (
                        [SubjectCode] ASC,
                        [CourseNumber] ASC,
                        [Status] ASC
                    );
                END;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'CreatedOnRaw') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [CreatedOnRaw] [datetime2](6) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'UpdatedOnRaw') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [UpdatedOnRaw] [datetime2](6) NULL;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                UPDATE [dbo].[CourseDescription]
                SET
                    [CreatedOnRaw] = TRY_CONVERT(datetime2(6), [CreatedOn]),
                    [UpdatedOnRaw] = TRY_CONVERT(datetime2(6), [UpdatedOn]);
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [CreatedOn];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [UpdatedOn];

                EXEC sp_rename N'[dbo].[CourseDescription].[CreatedOnRaw]', N'CreatedOn', N'COLUMN';
                EXEC sp_rename N'[dbo].[CourseDescription].[UpdatedOnRaw]', N'UpdatedOn', N'COLUMN';
                """,
                suppressTransaction: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'CreatedOnText') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [CreatedOnText] [nvarchar](50) NULL;
                IF COL_LENGTH(N'[dbo].[CourseDescription]', N'UpdatedOnText') IS NULL
                    ALTER TABLE [dbo].[CourseDescription] ADD [UpdatedOnText] [nvarchar](50) NULL;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                UPDATE [dbo].[CourseDescription]
                SET
                    [CreatedOnText] = CONVERT(nvarchar(50), [CreatedOn], 121),
                    [UpdatedOnText] = CONVERT(nvarchar(50), [UpdatedOn], 121);
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [CreatedOn];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [UpdatedOn];

                EXEC sp_rename N'[dbo].[CourseDescription].[CreatedOnText]', N'CreatedOn', N'COLUMN';
                EXEC sp_rename N'[dbo].[CourseDescription].[UpdatedOnText]', N'UpdatedOn', N'COLUMN';
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [FirstContactHoursPeriod];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [SecondContactHoursPeriod];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [ThirdContactHoursPeriod];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [FourthContactHoursPeriod];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge2ArtsHumanities];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge2ScienceEngineering];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge2SocialSciences];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge2Diversity];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge2WritingExperience];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3ArtsHumanities];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3ScienceEngineering];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3SocialSciences];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3AmericanCultures];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3DomesticDiversity];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3OralLiteracy];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3QuantitativeLiteracy];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3ScientificLiteracy];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3VisualLiteracy];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3WorldCultures];
                ALTER TABLE [dbo].[CourseDescription] DROP COLUMN [Ge3WritingExperience];
                """,
                suppressTransaction: true
            );
        }
    }
}
