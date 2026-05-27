using System;
using System.Linq;
using System.Text.RegularExpressions;
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

        public async Task<IActionResult> Index(string q)
        {
            var model = new CourseIndexViewModel
            {
                Query = q?.Trim(),
                HasSearched = !string.IsNullOrWhiteSpace(q)
            };

            if (!model.HasSearched)
            {
                return View(model);
            }

            model.NormalizedQuery = CourseNumberKey.Normalize(model.Query);

            if (!IsValidCourseSearch(model.NormalizedQuery))
            {
                model.IsValidSearch = false;
                model.ValidationMessage = "Search by a three-letter subject code or course number.";
                return View(model);
            }

            model.Courses = await _dbContext.Courses
                .Where(c => c.Number
                    .Replace(" ", "")
                    .Replace("\t", "")
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .ToUpper()
                    .StartsWith(model.NormalizedQuery))
                .OrderBy(c => c.Number
                    .Replace(" ", "")
                    .Replace("\t", "")
                    .Replace("\r", "")
                    .Replace("\n", "")
                    .ToUpper() == model.NormalizedQuery ? 0 : 1)
                .ThenBy(c => c.Number)
                .ToListAsync();

            return View(model);
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

        private static bool IsValidCourseSearch(string normalizedQuery)
        {
            if (string.IsNullOrWhiteSpace(normalizedQuery))
            {
                return false;
            }

            return Regex.IsMatch(normalizedQuery, "^[A-Z]{3}$")
                || Regex.IsMatch(normalizedQuery, "^[A-Z]{3}[0-9]{3}[A-Z]?$");
        }
    }
}
