using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260522152058_UseCoursesRawSourceTable")]
    public partial class UseCoursesRawSourceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[CoursesRaw]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[CoursesRaw]
                    (
                        [AcademicYear] [nvarchar](7) NULL,
                        [AcademicTermCode] [nvarchar](6) NULL,
                        [CollegeCode] [nvarchar](2) NULL,
                        [College] [nvarchar](100) NULL,
                        [DeptCode] [nvarchar](4) NULL,
                        [DeptName] [nvarchar](100) NULL,
                        [SubjectCode] [nvarchar](4) NULL,
                        [CourseNumber] [nvarchar](7) NULL,
                        [CourseName] [nvarchar](255) NULL,
                        [Enrollment] [int] NULL,
                        [NumCreditSections] [int] NULL,
                        [NumNonCreditSections] [int] NULL
                    );
                END;

                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'AcademicYear') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [AcademicYear] [nvarchar](7) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'AcademicTermCode') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [AcademicTermCode] [nvarchar](6) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'CollegeCode') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [CollegeCode] [nvarchar](2) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'College') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [College] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'DeptCode') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [DeptCode] [nvarchar](4) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'DeptName') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [DeptName] [nvarchar](100) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'SubjectCode') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [SubjectCode] [nvarchar](4) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'CourseNumber') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [CourseNumber] [nvarchar](7) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'CourseName') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [CourseName] [nvarchar](255) NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'Enrollment') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [Enrollment] [int] NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'NumCreditSections') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [NumCreditSections] [int] NULL;
                IF COL_LENGTH(N'[dbo].[CoursesRaw]', N'NumNonCreditSections') IS NULL
                    ALTER TABLE [dbo].[CoursesRaw] ADD [NumNonCreditSections] [int] NULL;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                IF EXISTS
                (
                    SELECT 1
                    FROM [dbo].[CoursesRaw]
                    WHERE LEN(CONVERT(nvarchar(max), [AcademicYear])) > 7
                        OR LEN(CONVERT(nvarchar(max), [AcademicTermCode])) > 6
                        OR LEN(CONVERT(nvarchar(max), [CollegeCode])) > 2
                        OR LEN(CONVERT(nvarchar(max), [College])) > 100
                        OR LEN(CONVERT(nvarchar(max), [DeptCode])) > 4
                        OR LEN(CONVERT(nvarchar(max), [DeptName])) > 100
                        OR LEN(CONVERT(nvarchar(max), [SubjectCode])) > 4
                        OR LEN(CONVERT(nvarchar(max), [CourseNumber])) > 7
                        OR LEN(CONVERT(nvarchar(max), [CourseName])) > 255
                )
                BEGIN
                    THROW 50014, 'CoursesRaw contains values too long for the expected source table schema.', 1;
                END;

                IF EXISTS
                (
                    SELECT 1
                    FROM [dbo].[CoursesRaw]
                    WHERE TRY_CONVERT(int, [Enrollment]) IS NULL AND [Enrollment] IS NOT NULL
                )
                BEGIN
                    THROW 50015, 'CoursesRaw contains Enrollment values that cannot be converted to int.', 1;
                END;

                IF EXISTS
                (
                    SELECT 1
                    FROM [dbo].[CoursesRaw]
                    WHERE TRY_CONVERT(int, [NumCreditSections]) IS NULL AND [NumCreditSections] IS NOT NULL
                )
                BEGIN
                    THROW 50016, 'CoursesRaw contains NumCreditSections values that cannot be converted to int.', 1;
                END;

                IF EXISTS
                (
                    SELECT 1
                    FROM [dbo].[CoursesRaw]
                    WHERE TRY_CONVERT(int, [NumNonCreditSections]) IS NULL AND [NumNonCreditSections] IS NOT NULL
                )
                BEGIN
                    THROW 50017, 'CoursesRaw contains NumNonCreditSections values that cannot be converted to int.', 1;
                END;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                IF EXISTS
                (
                    SELECT 1
                    FROM
                    (
                        VALUES
                            (N'AcademicYear', N'nvarchar', 7),
                            (N'AcademicTermCode', N'nvarchar', 6),
                            (N'CollegeCode', N'nvarchar', 2),
                            (N'College', N'nvarchar', 100),
                            (N'DeptCode', N'nvarchar', 4),
                            (N'DeptName', N'nvarchar', 100),
                            (N'SubjectCode', N'nvarchar', 4),
                            (N'CourseNumber', N'nvarchar', 7),
                            (N'CourseName', N'nvarchar', 255),
                            (N'Enrollment', N'int', NULL),
                            (N'NumCreditSections', N'int', NULL),
                            (N'NumNonCreditSections', N'int', NULL)
                    ) Expected([ColumnName], [DataType], [CharacterMaximumLength])
                    LEFT JOIN INFORMATION_SCHEMA.COLUMNS Columns
                        ON Columns.[TABLE_SCHEMA] = N'dbo'
                        AND Columns.[TABLE_NAME] = N'CoursesRaw'
                        AND Columns.[COLUMN_NAME] = Expected.[ColumnName]
                    WHERE Columns.[COLUMN_NAME] IS NULL
                        OR Columns.[DATA_TYPE] <> Expected.[DataType]
                        OR ISNULL(Columns.[CHARACTER_MAXIMUM_LENGTH], -1) <> ISNULL(Expected.[CharacterMaximumLength], -1)
                )
                BEGIN
                    DROP TABLE IF EXISTS [dbo].[CoursesRaw_Rebuild];

                    CREATE TABLE [dbo].[CoursesRaw_Rebuild]
                    (
                        [AcademicYear] [nvarchar](7) NULL,
                        [AcademicTermCode] [nvarchar](6) NULL,
                        [CollegeCode] [nvarchar](2) NULL,
                        [College] [nvarchar](100) NULL,
                        [DeptCode] [nvarchar](4) NULL,
                        [DeptName] [nvarchar](100) NULL,
                        [SubjectCode] [nvarchar](4) NULL,
                        [CourseNumber] [nvarchar](7) NULL,
                        [CourseName] [nvarchar](255) NULL,
                        [Enrollment] [int] NULL,
                        [NumCreditSections] [int] NULL,
                        [NumNonCreditSections] [int] NULL
                    );

                    INSERT INTO [dbo].[CoursesRaw_Rebuild]
                    (
                        [AcademicYear],
                        [AcademicTermCode],
                        [CollegeCode],
                        [College],
                        [DeptCode],
                        [DeptName],
                        [SubjectCode],
                        [CourseNumber],
                        [CourseName],
                        [Enrollment],
                        [NumCreditSections],
                        [NumNonCreditSections]
                    )
                    SELECT
                        CONVERT(nvarchar(7), [AcademicYear]),
                        CONVERT(nvarchar(6), [AcademicTermCode]),
                        CONVERT(nvarchar(2), [CollegeCode]),
                        CONVERT(nvarchar(100), [College]),
                        CONVERT(nvarchar(4), [DeptCode]),
                        CONVERT(nvarchar(100), [DeptName]),
                        CONVERT(nvarchar(4), [SubjectCode]),
                        CONVERT(nvarchar(7), [CourseNumber]),
                        CONVERT(nvarchar(255), [CourseName]),
                        CONVERT(int, [Enrollment]),
                        CONVERT(int, [NumCreditSections]),
                        CONVERT(int, [NumNonCreditSections])
                    FROM [dbo].[CoursesRaw];

                    DROP TABLE [dbo].[CoursesRaw];
                    EXEC sp_rename N'[dbo].[CoursesRaw_Rebuild]', N'CoursesRaw';
                END;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                DECLARE @OldTableName nvarchar(128) = N'CourseOfferingsRaw';
                DECLARE @NewTableName nvarchar(128) = N'CoursesRaw';
                DECLARE @Procedures TABLE
                (
                    [ProcedureName] nvarchar(300) NOT NULL PRIMARY KEY
                );

                INSERT INTO @Procedures ([ProcedureName])
                VALUES
                    (N'[dbo].[usp_GetCourseRebuildAcademicYearSpanOptions]'),
                    (N'[dbo].[usp_RebuildCoursesFromProcessingWindow]');

                DECLARE @ProcedureName nvarchar(300);

                DECLARE SourceProcedureCursor CURSOR LOCAL FAST_FORWARD FOR
                SELECT [ProcedureName]
                FROM @Procedures;

                OPEN SourceProcedureCursor;
                FETCH NEXT FROM SourceProcedureCursor INTO @ProcedureName;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    DECLARE @Definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(@ProcedureName));

                    IF @Definition IS NULL
                        THROW 50012, 'Expected course raw source consumer procedure was not found.', 1;

                    DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));
                    IF @ProcedureIndex = 0
                        THROW 50013, 'Expected course raw source consumer procedure did not contain a procedure definition.', 1;

                    IF CHARINDEX(@OldTableName, @Definition) > 0
                    BEGIN
                        SET @Definition = REPLACE(@Definition, @OldTableName, @NewTableName);
                        SET @Definition = STUFF(@Definition, 1, @ProcedureIndex - 1, N'CREATE OR ALTER ');

                        EXEC sp_executesql @Definition;
                    END;

                    FETCH NEXT FROM SourceProcedureCursor INTO @ProcedureName;
                END;

                CLOSE SourceProcedureCursor;
                DEALLOCATE SourceProcedureCursor;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[CoursesRaw]', N'U') IS NOT NULL
                    AND NOT EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CoursesRaw]')
                            AND name = N'IX_CoursesRaw_AcademicTermCode_AcademicYear'
                    )
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_CoursesRaw_AcademicTermCode_AcademicYear]
                    ON [dbo].[CoursesRaw] ([AcademicTermCode], [AcademicYear]);
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
                DECLARE @OldTableName nvarchar(128) = N'CoursesRaw';
                DECLARE @NewTableName nvarchar(128) = N'CourseOfferingsRaw';
                DECLARE @Procedures TABLE
                (
                    [ProcedureName] nvarchar(300) NOT NULL PRIMARY KEY
                );

                INSERT INTO @Procedures ([ProcedureName])
                VALUES
                    (N'[dbo].[usp_GetCourseRebuildAcademicYearSpanOptions]'),
                    (N'[dbo].[usp_RebuildCoursesFromProcessingWindow]');

                DECLARE @ProcedureName nvarchar(300);

                DECLARE SourceProcedureCursor CURSOR LOCAL FAST_FORWARD FOR
                SELECT [ProcedureName]
                FROM @Procedures;

                OPEN SourceProcedureCursor;
                FETCH NEXT FROM SourceProcedureCursor INTO @ProcedureName;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    DECLARE @Definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(@ProcedureName));

                    IF @Definition IS NULL
                        THROW 50012, 'Expected course raw source consumer procedure was not found.', 1;

                    DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));
                    IF @ProcedureIndex = 0
                        THROW 50013, 'Expected course raw source consumer procedure did not contain a procedure definition.', 1;

                    IF CHARINDEX(@OldTableName, @Definition) > 0
                    BEGIN
                        SET @Definition = REPLACE(@Definition, @OldTableName, @NewTableName);
                        SET @Definition = STUFF(@Definition, 1, @ProcedureIndex - 1, N'CREATE OR ALTER ');

                        EXEC sp_executesql @Definition;
                    END;

                    FETCH NEXT FROM SourceProcedureCursor INTO @ProcedureName;
                END;

                CLOSE SourceProcedureCursor;
                DEALLOCATE SourceProcedureCursor;
                """,
                suppressTransaction: true
            );

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[CoursesRaw]', N'U') IS NOT NULL
                    AND EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CoursesRaw]')
                            AND name = N'IX_CoursesRaw_AcademicTermCode_AcademicYear'
                    )
                BEGIN
                    DROP INDEX [IX_CoursesRaw_AcademicTermCode_AcademicYear]
                    ON [dbo].[CoursesRaw];
                END;
                """,
                suppressTransaction: true
            );
        }
    }
}
