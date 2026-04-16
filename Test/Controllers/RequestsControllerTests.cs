using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
    [Trait("Category", "Controller")]
    public class RequestsControllerTests
    {
        [Fact]
        public async Task Save_should_return_bad_request_when_user_cannot_access_department()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var allowedDepartment = CreateDepartment(1, "ECS");

            await SeedMembership(context, user, allowedDepartment);

            var controller = CreateController(context, user);

            var result = await controller.Save(CreateSubmissionModel(2, CreateRequestModel()));

            var badRequest = result.ShouldBeOfType<BadRequestObjectResult>();
            badRequest.Value.ShouldBe("Matching department not found among user's permission set.");
        }

        [Fact]
        public async Task Save_should_create_course_and_request_for_a_new_submission()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");

            await SeedMembership(context, user, department);

            var controller = CreateController(context, user);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    courseNumber: "ECS 188",
                    courseName: "Special Topics",
                    courseType: "MAN",
                    calculatedTaTotal: 1.25,
                    annualizedTaTotal: 0.417
                )
            );

            var result = await controller.Save(model);

            JsonResultShouldIndicateSuccess(result);

            var savedCourse = await context.Courses.SingleAsync(c => c.Number == "ECS 188");
            savedCourse.Name.ShouldBe("Special Topics");

            var savedRequest = await context.Requests.SingleAsync();
            savedRequest.DepartmentId.ShouldBe(department.Id);
            savedRequest.CourseNumber.ShouldBe("ECS 188");
            savedRequest.CourseType.ShouldBe("MAN");
            savedRequest.CalculatedTaTotal.ShouldBe(1.25);
            savedRequest.CalculatedReaderTotal.ShouldBe(0);
            savedRequest.AnnualizedTaTotal.ShouldBe(0.417);
            savedRequest.AnnualizedReaderTotal.ShouldBe(0);
            savedRequest.UpdatedBy.ShouldBe(user.UserName);
        }

        [Fact]
        public async Task Save_should_persist_split_support_fields()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");

            await SeedMembership(context, user, department);

            var controller = CreateController(context, user);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    courseNumber: "ECS 189A",
                    courseName: "Special Topics",
                    courseType: "MAN",
                    exception: true,
                    exceptionAnnualCount: 3,
                    calculatedTaTotal: 1.0,
                    calculatedReaderTotal: 0.25,
                    annualizedTaTotal: 0.333,
                    annualizedReaderTotal: 0.083,
                    exceptionTaTotal: 1.5,
                    exceptionReaderTotal: 0.25,
                    exceptionAnnualizedTaTotal: 1.5,
                    exceptionAnnualizedReaderTotal: 0.25
                )
            );

            var result = await controller.Save(model);

            JsonResultShouldIndicateSuccess(result);

            var savedRequest = await context.Requests.SingleAsync();
            savedRequest.CalculatedTaTotal.ShouldBe(1.0);
            savedRequest.CalculatedReaderTotal.ShouldBe(0.25);
            savedRequest.AnnualizedTaTotal.ShouldBe(0.333);
            savedRequest.AnnualizedReaderTotal.ShouldBe(0.083);
            savedRequest.ExceptionTaTotal.ShouldBe(1.5);
            savedRequest.ExceptionReaderTotal.ShouldBe(0.25);
            savedRequest.ExceptionAnnualizedTaTotal.ShouldBe(1.5);
            savedRequest.ExceptionAnnualizedReaderTotal.ShouldBe(0.25);
        }

        [Fact]
        public async Task Save_should_clear_approval_and_submission_state_when_request_is_no_longer_an_approved_exception()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");
            var course = CreateCourse("ECS 120");
            var request = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = course,
                CourseNumber = course.Number,
                CourseType = "STD",
                Exception = true,
                ExceptionReason = "Old exception",
                ExceptionTaTotal = 1.5,
                ExceptionAnnualCount = 3,
                ExceptionAnnualizedTaTotal = 1.5,
                CalculatedTaTotal = 1,
                AnnualizedTaTotal = 0.333,
                Approved = true,
                ApprovedComment = "Looks good",
                Submitted = true,
                SubmittedBy = "approver",
                SubmittedOn = DateTime.UtcNow
            };

            await SeedMembership(context, user, department);
            context.Courses.Add(course);
            context.Requests.Add(request);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    id: request.Id,
                    courseNumber: course.Number,
                    courseName: course.Name,
                    courseType: "STD",
                    exception: false,
                    calculatedTaTotal: 1,
                    annualizedTaTotal: 0.333
                )
            );

            await controller.Save(model);

            request.Exception.ShouldBeFalse();
            request.Approved.ShouldBeNull();
            request.ApprovedComment.ShouldBeNull();
            request.Submitted.ShouldBeFalse();
            request.SubmittedBy.ShouldBeNull();
            request.SubmittedOn.ShouldBeNull();
        }

        [Fact]
        public async Task Save_should_preserve_submission_state_for_an_existing_approved_exception()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");
            var course = CreateCourse("ECS 122");
            var submittedOn = DateTime.UtcNow.AddDays(-1);
            var request = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = course,
                CourseNumber = course.Number,
                CourseType = "MAN",
                Exception = true,
                ExceptionReason = "Current exception",
                ExceptionTaTotal = 1.25,
                ExceptionAnnualCount = 3,
                ExceptionAnnualizedTaTotal = 1.25,
                CalculatedTaTotal = 1,
                AnnualizedTaTotal = 0.333,
                Approved = true,
                ApprovedComment = "Approved",
                Submitted = true,
                SubmittedBy = "submitter",
                SubmittedOn = submittedOn
            };

            await SeedMembership(context, user, department);
            context.Courses.Add(course);
            context.Requests.Add(request);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    id: request.Id,
                    courseNumber: course.Number,
                    courseName: course.Name,
                    courseType: "MAN",
                    exception: true,
                    exceptionReason: "Updated justification",
                    exceptionAnnualCount: 3,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualizedTaTotal: 1.5,
                    calculatedTaTotal: 1.25,
                    annualizedTaTotal: 0.417
                )
            );

            await controller.Save(model);

            request.Exception.ShouldBeTrue();
            request.Approved.ShouldBe(true);
            request.ApprovedComment.ShouldBe("Approved");
            request.Submitted.ShouldBeTrue();
            request.SubmittedBy.ShouldBe("submitter");
            request.SubmittedOn.ShouldBe(submittedOn);
            request.ExceptionReason.ShouldBe("Updated justification");
            request.ExceptionTaTotal.ShouldBe(1.5);
            request.ExceptionReaderTotal.ShouldBe(0);
        }

        [Fact]
        public async Task Submit_should_auto_approve_standard_requests_and_email_pending_exception_requests()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");
            var standardCourse = CreateCourse("ECS 140");
            var exceptionCourse = CreateCourse("ECS 141");
            var standardRequest = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = standardCourse,
                CourseNumber = standardCourse.Number,
                CourseType = "STD",
                Exception = false,
                CalculatedTaTotal = 1,
                AnnualizedTaTotal = 0.333
            };
            var exceptionRequest = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = exceptionCourse,
                CourseNumber = exceptionCourse.Number,
                CourseType = "MAN",
                Exception = true,
                ExceptionReason = "Needs manual grading support",
                ExceptionTaTotal = 1.5,
                ExceptionAnnualCount = 3,
                ExceptionAnnualizedTaTotal = 1.5,
                CalculatedTaTotal = 1.25,
                AnnualizedTaTotal = 0.417
            };

            await SeedMembership(context, user, department);
            context.Courses.AddRange(standardCourse, exceptionCourse);
            context.Requests.AddRange(standardRequest, exceptionRequest);
            await context.SaveChangesAsync();

            var emailService = new Mock<IEmailService>();
            emailService
                .Setup(x => x.SendSubmissionNotification(It.IsAny<IReadOnlyList<Request>>()))
                .Returns(Task.CompletedTask);

            var controller = CreateController(context, user, emailService);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    id: standardRequest.Id,
                    courseNumber: standardCourse.Number,
                    courseName: standardCourse.Name,
                    courseType: "STD",
                    exception: false,
                    calculatedTaTotal: 1,
                    annualizedTaTotal: 0.333
                ),
                CreateRequestModel(
                    id: exceptionRequest.Id,
                    courseNumber: exceptionCourse.Number,
                    courseName: exceptionCourse.Name,
                    courseType: "MAN",
                    exception: true,
                    exceptionReason: "Needs manual grading support",
                    exceptionAnnualCount: 3,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualizedTaTotal: 1.5,
                    calculatedTaTotal: 1.25,
                    annualizedTaTotal: 0.417
                )
            );

            var result = await controller.Submit(model);

            JsonResultShouldIndicateSuccess(result);

            standardRequest.Submitted.ShouldBeTrue();
            standardRequest.SubmittedBy.ShouldBe(user.UserName);
            standardRequest.SubmittedOn.ShouldNotBeNull();
            standardRequest.Approved.ShouldBe(true);
            standardRequest.History.Count.ShouldBe(1);

            exceptionRequest.Submitted.ShouldBeTrue();
            exceptionRequest.SubmittedBy.ShouldBe(user.UserName);
            exceptionRequest.SubmittedOn.ShouldNotBeNull();
            exceptionRequest.Approved.ShouldBeNull();
            exceptionRequest.History.Count.ShouldBe(1);

            emailService.Verify(
                x => x.SendSubmissionNotification(
                    It.Is<IReadOnlyList<Request>>(requests =>
                        requests.Count == 1 && requests.Single().Id == exceptionRequest.Id)
                ),
                Times.Once
            );
        }

        [Fact]
        public async Task Submit_should_capture_split_support_fields_in_request_history()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");
            var course = CreateCourse("ECS 198");
            var request = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = course,
                CourseNumber = course.Number,
                CourseType = "MAN",
                Exception = true,
                ExceptionReason = "Old reason",
                ExceptionTaTotal = 1.25,
                ExceptionAnnualCount = 3,
                ExceptionAnnualizedTaTotal = 1.25,
                CalculatedTaTotal = 1,
                AnnualizedTaTotal = 0.333
            };

            await SeedMembership(context, user, department);
            context.Courses.Add(course);
            context.Requests.Add(request);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);
            var model = CreateSubmissionModel(
                department.Id,
                CreateRequestModel(
                    id: request.Id,
                    courseNumber: course.Number,
                    courseName: course.Name,
                    courseType: "MAN",
                    exception: true,
                    exceptionReason: "Needs both TA and Reader support",
                    exceptionAnnualCount: 3,
                    calculatedTaTotal: 1.0,
                    calculatedReaderTotal: 0.5,
                    annualizedTaTotal: 0.333,
                    annualizedReaderTotal: 0.167,
                    exceptionTaTotal: 1.5,
                    exceptionReaderTotal: 0.25,
                    exceptionAnnualizedTaTotal: 1.5,
                    exceptionAnnualizedReaderTotal: 0.25
                )
            );

            var result = await controller.Submit(model);

            JsonResultShouldIndicateSuccess(result);

            request.History.Count.ShouldBe(1);
            var history = request.History.Single();
            history.CalculatedTaTotal.ShouldBe(1.0);
            history.CalculatedReaderTotal.ShouldBe(0.5);
            history.AnnualizedTaTotal.ShouldBe(0.333);
            history.AnnualizedReaderTotal.ShouldBe(0.167);
            history.ExceptionTaTotal.ShouldBe(1.5);
            history.ExceptionReaderTotal.ShouldBe(0.25);
            history.ExceptionAnnualizedTaTotal.ShouldBe(1.5);
            history.ExceptionAnnualizedReaderTotal.ShouldBe(0.25);
        }

        [Fact]
        public async Task Revoke_should_clear_approval_and_submission_fields()
        {
            await using var context = CreateContext();
            var user = CreateUser();
            var department = CreateDepartment(1, "ECS");
            var course = CreateCourse("ECS 150");
            var request = new Request
            {
                Department = department,
                DepartmentId = department.Id,
                Course = course,
                CourseNumber = course.Number,
                CourseType = "MAN",
                Exception = true,
                Approved = true,
                ApprovedComment = "Approved",
                Submitted = true,
                SubmittedBy = "submitter",
                SubmittedOn = DateTime.UtcNow
            };

            await SeedMembership(context, user, department);
            context.Courses.Add(course);
            context.Requests.Add(request);
            await context.SaveChangesAsync();

            var controller = CreateController(context, user);

            var result = await controller.Revoke(request.Id);

            JsonResultShouldIndicateSuccess(result);

            request.Approved.ShouldBe(false);
            request.ApprovedComment.ShouldBeNull();
            request.Submitted.ShouldBeFalse();
            request.SubmittedBy.ShouldBeNull();
            request.SubmittedOn.ShouldBeNull();
        }

        private static RequestsController CreateController(
            TacoDbContext context,
            User user,
            Mock<IEmailService> emailService = null)
        {
            var controller = new RequestsController(
                context,
                CreateUserManager(user).Object,
                (emailService ?? new Mock<IEmailService>()).Object
            );

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity(
                            new[] { new Claim(ClaimTypes.NameIdentifier, user.Id) },
                            "Test"
                        )
                    )
                }
            };

            return controller;
        }

        private static Mock<UserManager<User>> CreateUserManager(User user)
        {
            var store = new Mock<IUserStore<User>>();
            var userManager = new Mock<UserManager<User>>(
                store.Object,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!,
                null!
            );

            userManager
                .Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()))
                .ReturnsAsync(user);

            return userManager;
        }

        private static TacoDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<TacoDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new TacoDbContext(options);
        }

        private static async Task SeedMembership(TacoDbContext context, User user, Department department)
        {
            context.Users.Add(user);
            context.Departments.Add(department);
            context.DepartmentRoles.Add(new DepartmentRole
            {
                Department = department,
                DepartmentId = department.Id,
                User = user,
                UserId = user.Id,
                Role = "Editor"
            });

            await context.SaveChangesAsync();
        }

        private static User CreateUser()
        {
            return new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "request-tester",
                Email = "request-tester@ucdavis.edu",
                Name = "Request Tester"
            };
        }

        private static Department CreateDepartment(int id, string code)
        {
            return new Department
            {
                Id = id,
                Code = code,
                Name = $"{code} Department"
            };
        }

        private static Course CreateCourse(string number)
        {
            return new Course
            {
                Number = number,
                Name = $"{number} Course",
                AverageEnrollment = 100,
                AverageSectionsPerCourse = 2,
                TimesOfferedPerYear = 1,
                IsOfferedWithinPastTwoYears = true
            };
        }

        private static SubmissionModel CreateSubmissionModel(int departmentId, params RequestModel[] requests)
        {
            return new SubmissionModel
            {
                DepartmentId = departmentId,
                Requests = requests
            };
        }

        private static RequestModel CreateRequestModel(
            int id = 0,
            string courseNumber = "ECS 101",
            string courseName = "Test Course",
            string courseType = "STD",
            bool exception = false,
            string exceptionReason = "",
            double exceptionTaTotal = 0,
            double exceptionReaderTotal = 0,
            double exceptionAnnualCount = 0,
            double exceptionAnnualizedTaTotal = 0,
            double exceptionAnnualizedReaderTotal = 0,
            double calculatedTaTotal = 0,
            double calculatedReaderTotal = 0,
            double annualizedTaTotal = 0,
            double annualizedReaderTotal = 0,
            bool isDeleted = false)
        {
            return new RequestModel
            {
                Id = id,
                CourseName = courseName,
                CourseNumber = courseNumber,
                CourseType = courseType,
                Exception = exception,
                ExceptionReason = exceptionReason,
                ExceptionTaTotal = exceptionTaTotal,
                ExceptionReaderTotal = exceptionReaderTotal,
                ExceptionAnnualCount = exceptionAnnualCount,
                ExceptionAnnualizedTaTotal = exceptionAnnualizedTaTotal,
                ExceptionAnnualizedReaderTotal = exceptionAnnualizedReaderTotal,
                CalculatedTaTotal = calculatedTaTotal,
                CalculatedReaderTotal = calculatedReaderTotal,
                AnnualizedTaTotal = annualizedTaTotal,
                AnnualizedReaderTotal = annualizedReaderTotal,
                IsDeleted = isDeleted
            };
        }

        private static void JsonResultShouldIndicateSuccess(IActionResult result)
        {
            var json = result.ShouldBeOfType<JsonResult>();
            var successProperty = json.Value.ShouldNotBeNull().GetType().GetProperty("success");

            successProperty.ShouldNotBeNull();
            successProperty.GetValue(json.Value).ShouldBe(true);
        }
    }
}
