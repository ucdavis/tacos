using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tacos.core.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAggregateSupportColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnnualizedTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "CalculatedTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ExceptionTotal",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "AnnualizedTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "CalculatedTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionAnnualizedTotal",
                table: "RequestHistory");

            migrationBuilder.DropColumn(
                name: "ExceptionTotal",
                table: "RequestHistory");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AnnualizedTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionTotal",
                table: "Requests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "AnnualizedTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CalculatedTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionAnnualizedTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ExceptionTotal",
                table: "RequestHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
