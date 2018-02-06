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
        [HttpGet("/course/{courseNumber}")]
        public IActionResult Get(string courseNumber) {
            // TODO: some basic validation checking

            // TODO: get data from some API or db
            return Json(new Course {
                Number = courseNumber,
                Name = courseNumber,
                TimesOfferedPerYear = 12,
                AverageSectionsPerCourse = 3,
                AverageEnrollment = 25
            });
        }
    }
}