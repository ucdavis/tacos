using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    public partial class CourseRebuildPreservesReferencedCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @Definition nvarchar(max) = OBJECT_DEFINITION(OBJECT_ID(N'[dbo].[usp_RebuildCoursesFromProcessingWindow]'));

                IF @Definition IS NULL
                    THROW 50008, 'dbo.usp_RebuildCoursesFromProcessingWindow was not found.', 1;

                DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));
                IF @ProcedureIndex = 0
                    THROW 50009, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected procedure definition.', 1;

                DECLARE @DeleteIndex int = CHARINDEX(N'DELETE ExistingCourses', @Definition);
                DECLARE @End int = CHARINDEX(N'COMMIT TRANSACTION', @Definition, @DeleteIndex);

                IF @DeleteIndex = 0 OR @End = 0
                    THROW 50011, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected course delete block.', 1;

                DECLARE @DeleteBlock nvarchar(max) = SUBSTRING(@Definition, @DeleteIndex, @End - @DeleteIndex);

                IF CHARINDEX(N'FROM [dbo].[Requests] Requests', @DeleteBlock) > 0
                    RETURN;

                DECLARE @Replacement nvarchar(max) = N'
                    DELETE ExistingCourses
                    FROM [dbo].[Courses] ExistingCourses
                    WHERE NOT EXISTS
                    (
                        SELECT 1
                        FROM #NewCourses NewCourses
                        WHERE NewCourses.[Number] = ExistingCourses.[Number]
                    )
                    AND NOT EXISTS
                    (
                        SELECT 1
                        FROM [dbo].[Requests] Requests
                        WHERE Requests.[CourseNumber] = ExistingCourses.[Number]
                    );

                    ';

                SET @Definition = STUFF(@Definition, @DeleteIndex, @End - @DeleteIndex, @Replacement);
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

                IF @Definition IS NULL
                    THROW 50008, 'dbo.usp_RebuildCoursesFromProcessingWindow was not found.', 1;

                DECLARE @ProcedureIndex int = CHARINDEX(N'PROCEDURE', UPPER(@Definition));
                IF @ProcedureIndex = 0
                    THROW 50009, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected procedure definition.', 1;

                DECLARE @DeleteIndex int = CHARINDEX(N'DELETE ExistingCourses', @Definition);
                DECLARE @End int = CHARINDEX(N'COMMIT TRANSACTION', @Definition, @DeleteIndex);

                IF @DeleteIndex = 0 OR @End = 0
                    THROW 50011, 'dbo.usp_RebuildCoursesFromProcessingWindow did not contain the expected course delete block.', 1;

                DECLARE @DeleteBlock nvarchar(max) = SUBSTRING(@Definition, @DeleteIndex, @End - @DeleteIndex);

                IF CHARINDEX(N'FROM [dbo].[Requests] Requests', @DeleteBlock) = 0
                    RETURN;

                DECLARE @Replacement nvarchar(max) = N'
                    DELETE ExistingCourses
                    FROM [dbo].[Courses] ExistingCourses
                    WHERE NOT EXISTS
                    (
                        SELECT 1
                        FROM #NewCourses NewCourses
                        WHERE NewCourses.[Number] = ExistingCourses.[Number]
                    );

                    ';

                SET @Definition = STUFF(@Definition, @DeleteIndex, @End - @DeleteIndex, @Replacement);
                SET @Definition = STUFF(@Definition, 1, @ProcedureIndex - 1, N'CREATE OR ALTER ');

                EXEC sp_executesql @Definition;
                """,
                suppressTransaction: true
            );
        }
    }
}
