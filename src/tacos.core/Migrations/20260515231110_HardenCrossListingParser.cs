using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    public partial class HardenCrossListingParser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR ALTER FUNCTION [dbo].[udf_ParseCrossListedCourseNumbers]
                (
                    @Course nvarchar(20),
                    @CrossListing nvarchar(200)
                )
                RETURNS @Courses TABLE
                (
                    [CourseNumber] nvarchar(20) NOT NULL PRIMARY KEY
                )
                AS
                BEGIN
                    DECLARE @CourseKey nvarchar(20) = UPPER(REPLACE(REPLACE(LTRIM(RTRIM(COALESCE(@Course, N''))), N' ', N''), N'.', N''));

                    IF @CourseKey <> N''
                    BEGIN
                        INSERT INTO @Courses ([CourseNumber])
                        VALUES (@CourseKey);
                    END;

                    DECLARE @List nvarchar(200) = UPPER(COALESCE(@CrossListing, N''));
                    SET @List = REPLACE(@List, N'CROSS-LISTING WITH ', N'');
                    SET @List = REPLACE(@List, N'CROSS LISTED WITH ', N'');
                    SET @List = REPLACE(@List, N'.', N'');
                    SET @List = REPLACE(@List, N';', N',');
                    SET @List = REPLACE(@List, N' 12Y', N' 012Y');
                    SET @List = REPLACE(@List, N', AND ', N',');
                    SET @List = REPLACE(@List, N' AND ', N',');

                    INSERT INTO @Courses ([CourseNumber])
                    SELECT DISTINCT Parsed.CourseNumber
                    FROM STRING_SPLIT(@List, N',') SplitValues
                    CROSS APPLY
                    (
                        SELECT UPPER(REPLACE(LTRIM(RTRIM(SplitValues.[value])), N' ', N'')) AS CourseNumber
                    ) Parsed
                    WHERE Parsed.CourseNumber <> N''
                        AND LEN(Parsed.CourseNumber) <= 20
                        AND NOT EXISTS
                        (
                            SELECT 1
                            FROM @Courses Existing
                            WHERE Existing.CourseNumber = Parsed.CourseNumber
                        );

                    RETURN;
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
                CREATE OR ALTER FUNCTION [dbo].[udf_ParseCrossListedCourseNumbers]
                (
                    @Course nvarchar(20),
                    @CrossListing nvarchar(200)
                )
                RETURNS @Courses TABLE
                (
                    [CourseNumber] nvarchar(20) NOT NULL PRIMARY KEY
                )
                AS
                BEGIN
                    DECLARE @CourseKey nvarchar(20) = UPPER(REPLACE(REPLACE(LTRIM(RTRIM(COALESCE(@Course, N''))), N' ', N''), N'.', N''));

                    IF @CourseKey <> N''
                    BEGIN
                        INSERT INTO @Courses ([CourseNumber])
                        VALUES (@CourseKey);
                    END;

                    DECLARE @List nvarchar(200) = UPPER(COALESCE(@CrossListing, N''));
                    SET @List = REPLACE(@List, N'.', N'');
                    SET @List = REPLACE(@List, N';', N',');
                    SET @List = REPLACE(@List, N' 12Y', N' 012Y');
                    SET @List = REPLACE(@List, N', AND ', N',');
                    SET @List = REPLACE(@List, N' AND ', N',');

                    INSERT INTO @Courses ([CourseNumber])
                    SELECT DISTINCT Parsed.CourseNumber
                    FROM STRING_SPLIT(@List, N',') SplitValues
                    CROSS APPLY
                    (
                        SELECT UPPER(REPLACE(LTRIM(RTRIM(SplitValues.[value])), N' ', N'')) AS CourseNumber
                    ) Parsed
                    WHERE Parsed.CourseNumber <> N''
                        AND LEN(Parsed.CourseNumber) <= 20
                        AND NOT EXISTS
                        (
                            SELECT 1
                            FROM @Courses Existing
                            WHERE Existing.CourseNumber = Parsed.CourseNumber
                        );

                    RETURN;
                END;
                """,
                suppressTransaction: true
            );
        }
    }
}
