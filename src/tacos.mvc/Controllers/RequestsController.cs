using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Extensions;
using tacos.mvc.Models;

namespace tacos.mvc.Controllers
{
    public class RequestsController : ApplicationController
    {
        private readonly TacoDbContext _context;
        private readonly UserManager<User> _userManager;

        public RequestsController(TacoDbContext context, UserManager<User> userManager)
        {
            this._context = context;
            this._userManager = userManager;
        }

        // list submissions
        public async Task<IActionResult> Index(string code)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            var department = !string.IsNullOrWhiteSpace(code)
                ? departments.SingleOrDefault(d => string.Equals(d.Code, code, StringComparison.OrdinalIgnoreCase))
                : departments.FirstOrDefault();

            if (department == null)
            {
                // could not find a valid department
                return Forbid();
            }

            ViewBag.Department = department;

            // get requests for department
            var requests = await _context.Requests
                .Include(r => r.Department)
                .Where(r => r.Department.Id == department.Id)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        public async Task<IActionResult> Details(int id)
        {
            var request = await _context.Requests
                .SingleAsync(x => x.Id == id);

            return View(request);
        }

        public async Task<IActionResult> Create()
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            return View();
        }

        public async Task<IActionResult> Edit(string code)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            var department = !string.IsNullOrWhiteSpace(code)
                ? departments.SingleOrDefault(d => string.Equals(d.Code, code, StringComparison.OrdinalIgnoreCase))
                : departments.FirstOrDefault();

            if (department == null)
            {
                // could not find a valid department
                return Forbid();
            }

            ViewBag.Department = department;

            // get requests for department
            var requests = await _context.Requests
                .Include(r => r.Course)
                .Where(r => r.Department.Id == department.Id)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody]SubmissionModel model)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            // find matching department
            var department = departments.SingleOrDefault(d => d.Id == model.DepartmentId);
            if (department == null)
            {
                return BadRequest("Matching department not found among user's permission set.");
            }

            var creatorName = $"{user.LastName}, {user.FirstName}";

            var requests = new List<Request>();
            foreach (var m in model.Requests)
            {
                // find course
                var course = await _context.Courses.FindAsync(m.CourseNumber);

                // find or create new request
                var request = await _context.Requests
                    .FirstOrDefaultAsync(r =>
                        string.Equals(r.CourseNumber, m.CourseNumber, StringComparison.OrdinalIgnoreCase));

                // create request if necessary
                if (request == null)
                {
                    request = new Request()
                    {
                        DepartmentId             = department.Id,
                        CourseNumber             = course.Number,
                        AverageSectionsPerCourse = course.AverageSectionsPerCourse,
                        AverageEnrollment        = course.AverageEnrollment,
                        TimesOfferedPerYear      = course.TimesOfferedPerYear,
                    };
                    _context.Requests.Add(request);
                }
                else
                {
                    // copy out values to a history entry
                }

                // update values
                request.CourseType               = m.CourseType;
                request.RequestType              = m.RequestType;
                request.Exception                = m.Exception;
                request.ExceptionReason          = m.ExceptionReason;
                request.ExceptionTotal           = m.ExceptionTotal;
                request.ExceptionAnnualizedTotal = m.ExceptionAnnualizedTotal;
                request.CalculatedTotal          = m.CalculatedTotal;
                request.AnnualizedTotal          = m.AnnualizedTotal;

                // auto approve any un-exception requests
                if (!request.Exception)
                {
                    request.Approved = true;
                }
            }

            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }
    }
}