using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    public partial class SplitTaReaderPhase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AnnualizedReaderTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "AnnualizedTaTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedReaderTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedTaTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedReaderTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedTaTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionReaderTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionTaTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "AnnualizedReaderTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "AnnualizedTaTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedReaderTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedTaTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedReaderTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedTaTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionReaderTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionTaTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.Sql(
                """
                UPDATE [Requests]
                SET
                    [CalculatedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [CalculatedTotal] ELSE 0 END,
                    [CalculatedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [CalculatedTotal] ELSE 0 END,
                    [AnnualizedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [AnnualizedTotal] ELSE 0 END,
                    [AnnualizedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [AnnualizedTotal] ELSE 0 END,
                    [ExceptionTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [ExceptionTotal] ELSE 0 END,
                    [ExceptionReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [ExceptionTotal] ELSE 0 END,
                    [ExceptionAnnualizedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [ExceptionAnnualizedTotal] ELSE 0 END,
                    [ExceptionAnnualizedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [ExceptionAnnualizedTotal] ELSE 0 END
                WHERE [RequestType] IN ('TA', 'READ');
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE [RequestHistory]
                SET
                    [CalculatedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [CalculatedTotal] ELSE 0 END,
                    [CalculatedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [CalculatedTotal] ELSE 0 END,
                    [AnnualizedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [AnnualizedTotal] ELSE 0 END,
                    [AnnualizedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [AnnualizedTotal] ELSE 0 END,
                    [ExceptionTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [ExceptionTotal] ELSE 0 END,
                    [ExceptionReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [ExceptionTotal] ELSE 0 END,
                    [ExceptionAnnualizedTaTotal] = CASE WHEN [RequestType] = 'TA' THEN [ExceptionAnnualizedTotal] ELSE 0 END,
                    [ExceptionAnnualizedReaderTotal] = CASE WHEN [RequestType] = 'READ' THEN [ExceptionAnnualizedTotal] ELSE 0 END
                WHERE [RequestType] IN ('TA', 'READ');
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnnualizedReaderTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "AnnualizedTaTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "CalculatedReaderTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "CalculatedTaTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedReaderTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedTaTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionReaderTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionTaTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "AnnualizedReaderTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "AnnualizedTaTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "CalculatedReaderTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "CalculatedTaTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedReaderTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedTaTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionReaderTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionTaTotal",
                table: "RequestHistory");
        }
    }
}
