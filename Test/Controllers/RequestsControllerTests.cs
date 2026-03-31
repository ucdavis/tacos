using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Controllers;
using tacos.mvc.Models;
using tacos.mvc.services;
using Xunit;

namespace Test.Controllers
{
    public class RequestsControllerTests
    {
        [Fact]
        public async Task Calculate_should_return_backend_preview_totals_for_the_request()
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            await using var context = await CreateContextAsync(connection);

            var user = await SeedUserAndDepartmentAsync(context);
            var controller = CreateController(context, user);
            var model = new RequestModel
            {
                Course = new Course
                {
                    Number = "ECS010",
                    Name = "Special Topics",
                    AverageEnrollment = 80,
                    AverageSectionsPerCourse = 5,
                    TimesOfferedPerYear = 1,
                    CrossListingsString = string.Empty,
                    IsCrossListed = false,
                    IsOfferedWithinPastTwoYears = true,
                },
                CourseName = "Special Topics",
                CourseNumber = "ECS010",
                CourseType = "WRT",
                RequestType = "TA",
                ExceptionTotal = 1.25,
                ExceptionAnnualCount = 2,
            };

            var result = await controller.Calculate(model);

            var json = result.ShouldBeOfType<JsonResult>();
            var payload = json.Value.ShouldBeOfType<RequestCalculationResultModel>();

            payload.CalculatedTotal.ShouldBe(1.0);
            payload.AnnualizedTotal.ShouldBe(1.0 / 3.0, 0.0001);
            payload.ExceptionAnnualizedTotal.ShouldBe(5.0 / 6.0, 0.0001);
        }

        [Fact]
        public async Task Save_should_recalculate_totals_from_course_data_instead_of_trusting_the_client()
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            await using var context = await CreateContextAsync(connection);

            var user = await SeedUserAndDepartmentAsync(context);
            var course = new Course
            {
                Number = "ECS001",
                Name = "Intro to TACOS",
                AverageEnrollment = 111,
                AverageSectionsPerCourse = 2,
                TimesOfferedPerYear = 2,
                CrossListingsString = string.Empty,
                IsCrossListed = false,
                IsOfferedWithinPastTwoYears = true,
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);
            var model = new SubmissionModel
            {
                DepartmentId = 1,
                Requests =
                [
                    new RequestModel
                    {
                        CourseName = course.Name,
                        CourseNumber = course.Number,
                        CourseType = "STD",
                        RequestType = "TA",
                        Exception = true,
                        ExceptionReason = "Needs extra support",
                        ExceptionTotal = 1.25,
                        ExceptionAnnualCount = 2,
                        ExceptionAnnualizedTotal = 999,
                        CalculatedTotal = 999,
                        AnnualizedTotal = 999,
                    }
                ]
            };

            var result = await controller.Save(model);

            result.ShouldBeOfType<JsonResult>();

            var savedRequest = await context.Requests.SingleAsync();
            savedRequest.CalculatedTotal.ShouldBe(1.0);
            savedRequest.AnnualizedTotal.ShouldBe(2.0 / 3.0, 0.0001);
            savedRequest.ExceptionAnnualizedTotal.ShouldBe(5.0 / 6.0, 0.0001);
        }

        [Fact]
        public async Task Save_should_zero_out_every_other_year_courses_during_the_off_year()
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            await using var context = await CreateContextAsync(connection);

            var user = await SeedUserAndDepartmentAsync(context);
            var course = new Course
            {
                Number = "ECS002",
                Name = "Field Methods",
                AverageEnrollment = 25,
                AverageSectionsPerCourse = 1,
                TimesOfferedPerYear = 1,
                CrossListingsString = string.Empty,
                IsCrossListed = false,
                IsOfferedWithinPastTwoYears = true,
                IsCourseTaughtOnceEveryTwoYears = true,
                WasCourseTaughtInMostRecentYear = true,
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);
            var model = new SubmissionModel
            {
                DepartmentId = 1,
                Requests =
                [
                    new RequestModel
                    {
                        CourseName = course.Name,
                        CourseNumber = course.Number,
                        CourseType = "FLD",
                        RequestType = "TA",
                    }
                ]
            };

            await controller.Save(model);

            var savedRequest = await context.Requests.SingleAsync();
            savedRequest.CalculatedTotal.ShouldBe(0.5);
            savedRequest.AnnualizedTotal.ShouldBe(0);
        }

        [Fact]
        public async Task Submit_should_auto_approve_non_exception_requests_and_capture_history()
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            await using var context = await CreateContextAsync(connection);

            var user = await SeedUserAndDepartmentAsync(context);
            var course = new Course
            {
                Number = "ECS003",
                Name = "Writing Lab",
                AverageEnrollment = 80,
                AverageSectionsPerCourse = 5,
                TimesOfferedPerYear = 1,
                CrossListingsString = string.Empty,
                IsCrossListed = false,
                IsOfferedWithinPastTwoYears = true,
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            var emailService = new Mock<IEmailService>();
            var controller = CreateController(context, user, emailService);
            var model = new SubmissionModel
            {
                DepartmentId = 1,
                Requests =
                [
                    new RequestModel
                    {
                        CourseName = course.Name,
                        CourseNumber = course.Number,
                        CourseType = "WRT",
                        RequestType = "TA",
                    }
                ]
            };

            var result = await controller.Submit(model);

            result.ShouldBeOfType<JsonResult>();

            var savedRequest = await context.Requests
                .Include(r => r.History)
                .SingleAsync();

            savedRequest.Submitted.ShouldBeTrue();
            savedRequest.Approved.ShouldBe(true);
            savedRequest.CalculatedTotal.ShouldBe(1.0);
            savedRequest.AnnualizedTotal.ShouldBe(1.0 / 3.0, 0.0001);
            savedRequest.History.Count.ShouldBe(1);

            var history = savedRequest.History.Single();
            history.CalculatedTotal.ShouldBe(1.0);
            history.AnnualizedTotal.ShouldBe(1.0 / 3.0, 0.0001);
            history.CourseNumber.ShouldBe(course.Number);
            history.AverageEnrollment.ShouldBe(80);

            emailService.Verify(
                service => service.SendSubmissionNotification(It.IsAny<System.Collections.Generic.IReadOnlyList<Request>>()),
                Times.Never);
        }

        private static RequestsController CreateController(
            TacoDbContext context,
            User user,
            Mock<IEmailService> emailService = null)
        {
            var userStore = new Mock<IUserStore<User>>();
            var userManager = new Mock<UserManager<User>>(
                userStore.Object,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!);

            userManager
                .Setup(manager => manager.GetUserAsync(It.IsAny<ClaimsPrincipal>()))
                .ReturnsAsync(user);

            var controller = new RequestsController(
                context,
                userManager.Object,
                emailService?.Object ?? Mock.Of<IEmailService>());

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity(
                            [new Claim(ClaimTypes.NameIdentifier, user.Id)],
                            "TestAuth"))
                }
            };

            return controller;
        }

        private static async Task<TacoDbContext> CreateContextAsync(SqliteConnection connection)
        {
            var options = new DbContextOptionsBuilder<TacoDbContext>()
                .UseSqlite(connection)
                .Options;

            var context = new TacoDbContext(options);
            await context.Database.EnsureCreatedAsync();

            return context;
        }

        private static async Task<User> SeedUserAndDepartmentAsync(TacoDbContext context)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString("N"),
                UserName = "tester",
                NormalizedUserName = "TESTER",
                Email = "tester@example.com",
                NormalizedEmail = "TESTER@EXAMPLE.COM",
                Name = "Test User",
            };

            var department = new Department
            {
                Id = 1,
                Code = "ECS",
                Name = "Engineering Computer Science",
            };

            var departmentRole = new DepartmentRole
            {
                Department = department,
                DepartmentId = department.Id,
                Role = "Editor",
                User = user,
                UserId = user.Id,
            };

            context.Users.Add(user);
            context.Departments.Add(department);
            context.DepartmentRoles.Add(departmentRole);
            await context.SaveChangesAsync();

            return user;
        }
    }
}
