using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(TacoDbContext))]
    [Migration("20260518134500_CourseOfferingsRawTermYearIndex")]
    public partial class CourseOfferingsRawTermYearIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[dbo].[CourseOfferingsRaw]', N'U') IS NOT NULL
                    AND NOT EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CourseOfferingsRaw]')
                            AND name = N'IX_CourseOfferingsRaw_AcademicTermCode_AcademicYear'
                    )
                BEGIN
                    CREATE NONCLUSTERED INDEX [IX_CourseOfferingsRaw_AcademicTermCode_AcademicYear]
                    ON [dbo].[CourseOfferingsRaw] ([AcademicTermCode], [AcademicYear]);
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
                IF OBJECT_ID(N'[dbo].[CourseOfferingsRaw]', N'U') IS NOT NULL
                    AND EXISTS
                    (
                        SELECT 1
                        FROM sys.indexes
                        WHERE object_id = OBJECT_ID(N'[dbo].[CourseOfferingsRaw]')
                            AND name = N'IX_CourseOfferingsRaw_AcademicTermCode_AcademicYear'
                    )
                BEGIN
                    DROP INDEX [IX_CourseOfferingsRaw_AcademicTermCode_AcademicYear]
                    ON [dbo].[CourseOfferingsRaw];
                END;
                """,
                suppressTransaction: true
            );
        }
    }
}
