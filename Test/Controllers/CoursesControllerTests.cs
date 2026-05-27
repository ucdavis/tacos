using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Controllers;
using tacos.mvc.Models.CourseViewModels;
using Xunit;

namespace Test.Controllers
{
    [Trait("Category", "Controller")]
    public class CoursesControllerTests
    {
        [Fact]
        public async Task Index_without_query_should_return_empty_search_model()
        {
            await using var context = CreateContext();
            context.Courses.Add(CreateCourse("ANS002"));
            await context.SaveChangesAsync();

            var model = await IndexModel(context, null);

            model.HasSearched.ShouldBeFalse();
            model.IsValidSearch.ShouldBeTrue();
            model.Courses.ShouldBeEmpty();
        }

        [Fact]
        public async Task Index_should_return_courses_matching_subject_code()
        {
            await using var context = CreateContext();
            context.Courses.AddRange(
                CreateCourse("ANS002"),
                CreateCourse("ANS110"),
                CreateCourse("ECS032A"));
            await context.SaveChangesAsync();

            var model = await IndexModel(context, "ANS");

            model.HasSearched.ShouldBeTrue();
            model.IsValidSearch.ShouldBeTrue();
            model.Courses.Select(c => c.Number).ShouldBe(new[] { "ANS002", "ANS110" });
        }

        [Theory]
        [InlineData("ANS 002")]
        [InlineData("ANS002")]
        public async Task Index_should_normalize_course_input_and_return_prefix_matches(string query)
        {
            await using var context = CreateContext();
            context.Courses.AddRange(
                CreateCourse("ANS002B"),
                CreateCourse("ANS002"),
                CreateCourse("ANS002A"),
                CreateCourse("ANS003"));
            await context.SaveChangesAsync();

            var model = await IndexModel(context, query);

            model.IsValidSearch.ShouldBeTrue();
            model.Courses.Select(c => c.Number).ShouldBe(new[] { "ANS002", "ANS002A", "ANS002B" });
        }

        [Fact]
        public async Task Index_should_match_spaced_letter_suffix_course_input()
        {
            await using var context = CreateContext();
            context.Courses.AddRange(
                CreateCourse("ANS002"),
                CreateCourse("ANS002A"),
                CreateCourse("ANS002B"));
            await context.SaveChangesAsync();

            var model = await IndexModel(context, "ANS 002B");

            model.IsValidSearch.ShouldBeTrue();
            model.NormalizedQuery.ShouldBe("ANS002B");
            model.Courses.Select(c => c.Number).ShouldBe(new[] { "ANS002B" });
        }

        [Theory]
        [InlineData("ANS0")]
        [InlineData("young adult literature")]
        public async Task Index_should_reject_non_course_input(string query)
        {
            await using var context = CreateContext();
            context.Courses.Add(CreateCourse("ANS002"));
            await context.SaveChangesAsync();

            var model = await IndexModel(context, query);

            model.HasSearched.ShouldBeTrue();
            model.IsValidSearch.ShouldBeFalse();
            model.ValidationMessage.ShouldBe("Search by a three-letter subject code or course number.");
            model.Courses.ShouldBeEmpty();
        }

        private static async Task<CourseIndexViewModel> IndexModel(TacoDbContext context, string query)
        {
            var controller = new CoursesController(context);
            var result = await controller.Index(query);
            var view = result.ShouldBeOfType<ViewResult>();
            return view.Model.ShouldBeOfType<CourseIndexViewModel>();
        }

        private static TacoDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<TacoDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new TacoDbContext(options);
        }

        private static Course CreateCourse(string number)
        {
            return new Course
            {
                Number = number,
                Name = $"{number} Course",
                AverageEnrollment = 10,
                AverageSectionsPerCourse = 1,
                TimesOfferedPerYear = 1
            };
        }
    }
}
