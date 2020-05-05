using System;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.core;
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
            var course = await _dbContext.Courses
                .SingleOrDefaultAsync(c => c.Number == id);

            if (course == null)
            {
                return NotFound();
            }

            var description = await _dbContext.CourseDescriptions
                .SingleOrDefaultAsync(c => c.Course == id);

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

            // remove whitespaces
            var parsedCourseNumber = Regex.Replace(courseNumber, @"\s", "");

            var course = await _dbContext.Courses
                .Where(x => parsedCourseNumber == x.Number)
                .SingleOrDefaultAsync();

            if (course == null)
            {
                return NotFound();
            }
            
            return Json(course);
        }
    }
}
