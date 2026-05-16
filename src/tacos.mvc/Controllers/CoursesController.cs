using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.core;
using tacos.core.Resources;
using tacos.mvc.Extensions;
using tacos.mvc.Models.CourseViewModels;

namespace tacos.mvc.Controllers
{
    public class CoursesController : ApplicationController
    {
        private readonly TacoDbContext _dbContext;

        public CoursesController(TacoDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IActionResult> Index()
        {
            var courses = await _dbContext.Courses
                .ToListAsync();

            return View(courses);
        }

        public async Task<IActionResult> Details(string id)
        {
            if (string.IsNullOrWhiteSpace(id) || id.Length < 4)
            {
                return NotFound();
            }

            var courseNumber = CourseNumberKey.Normalize(id);
            var course = await _dbContext.Courses
                .MatchingCourseNumber(courseNumber)
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound();
            }

            var description = await _dbContext.CourseDescriptions
                .MatchingCourseNumber(courseNumber)
                .FirstOrDefaultAsync();

            var model = new CourseDetailsViewModel
            {
                Course = course,
                Description = description
            };

            return View(model);
        }

        [HttpGet("/course/{courseNumber}")]
        public async Task<IActionResult> Get(string courseNumber)
        {
            // make sure we have at least 4 chars
            if (courseNumber == null || courseNumber.Length < 4)
            {
                return NotFound();
            }

            var parsedCourseNumber = CourseNumberKey.Normalize(courseNumber);

            var course = await _dbContext.Courses
                .MatchingCourseNumber(parsedCourseNumber)
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound();
            }
            
            return Json(course);
        }
    }
}
