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
                """
                DECLARE @Definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'[dbo].[usp_RebuildCoursesFromProcessingWindow]'));
                DECLARE @ThrowIndex int = CHARINDEX(N'THROW 50007', @Definition);
                DECLARE @Start int = @ThrowIndex;
                DECLARE @End int = CHARINDEX(N'UPDATE ExistingCourses', @Definition, @ThrowIndex);
                DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));

                IF @Definition IS NULL
                    THROW 50008, 'dbo.usp_RebuildCoursesFromProcessingWindow was not found.', 1;

                IF @ThrowIndex = 0 OR @End = 0 OR @ProcedureIndex = 0
                    THROW 50009, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected request guard.', 1;

                WHILE @Start > 1 AND SUBSTRING(@Definition, @Start, LEN(N'IF EXISTS')) <> N'IF EXISTS'
                BEGIN
                    SET @Start -= 1;
                END;

                IF @Start = 1
                    THROW 50010, 'dbo.usp_RebuildCoursesFromProcessingWindow request guard start was not found.', 1;

                DECLARE @Replacement nvarchar(max) = N'
                    UPDATE Requests
                    SET [CourseNumber] = NewCourses.[Number]
                    FROM [dbo].[Requests] Requests
                    INNER JOIN #NewCourses NewCourses
                        ON NewCourses.[Number] = UPPER(REPLACE(LTRIM(RTRIM(Requests.[CourseNumber])), N'' '', N''''));

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
                        WHERE NewCourses.[Number] = UPPER(REPLACE(LTRIM(RTRIM(Requests.[CourseNumber])), N'' '', N''''))
                    );

                    ';

                SET @Definition = STUFF(@Definition, @Start, @End - @Start, @Replacement);
                SET @Definition = STUFF(@Definition, 1, @ProcedureIndex - 1, N'CREATE OR ALTER ');

                EXEC sp_executesql @Definition;
                """,
                suppressTransaction: true
            );

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @Definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'[dbo].[usp_RebuildCoursesFromProcessingWindow]'));
                DECLARE @ResetIndex int = CHARINDEX(N'UPDATE [dbo].[Requests]', @Definition);
                DECLARE @Start int = CHARINDEX(N'UPDATE Requests', @Definition);
                DECLARE @End int = CHARINDEX(N'UPDATE ExistingCourses', @Definition, @ResetIndex);
                DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));

                IF @Definition IS NULL
                    THROW 50008, 'dbo.usp_RebuildCoursesFromProcessingWindow was not found.', 1;

                IF @Start = 0 OR @ResetIndex = 0 OR @End = 0 OR @ProcedureIndex = 0
                    THROW 50009, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected reset block.', 1;

                DECLARE @Replacement nvarchar(max) = N'
                    IF EXISTS
                    (
                        SELECT 1
                        FROM [dbo].[Requests] Requests
                        WHERE NOT EXISTS
                        (
                            SELECT 1
                            FROM #NewCourses NewCourses
                            WHERE NewCourses.[Number] = Requests.[CourseNumber]
                        )
                    )
                    BEGIN
                        THROW 50007, ''Course list rebuild would remove one or more courses referenced by existing requests. Reset or archive those requests before rebuilding.'', 1;
                    END;

                    ';

                SET @Definition = STUFF(@Definition, @Start, @End - @Start, @Replacement);
                SET @Definition = STUFF(@Definition, 1, @ProcedureIndex - 1, N'CREATE OR ALTER ');

                EXEC sp_executesql @Definition;
                """,
                suppressTransaction: true
            );

        }
    }
}
