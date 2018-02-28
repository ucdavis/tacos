using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Models;

namespace tacos.mvc.Controllers
{
    public class CourseController : ApplicationController
    {
        private readonly TacoDbContext dbContext;

        public CourseController(TacoDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        [HttpGet("/course/{courseNumber}")]
        public async Task<IActionResult> Get(string courseNumber)
        {
            // make sure we have at least 4 chars
            if (courseNumber == null || courseNumber.Length < 4) return null;

            var course = await dbContext.Courses
                .Where(x => string.Equals(courseNumber, x.Number, StringComparison.OrdinalIgnoreCase))
                .SingleOrDefaultAsync();

            if (course == null) return NotFound();
            
            return Json(course);
        }
    }
}