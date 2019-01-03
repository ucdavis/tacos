using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Data;
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
                .Where(r => r.IsActive)
                .Where(r => r.Department.Id == department.Id)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        public async Task<IActionResult> Details(int id)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            var departmentIds = departments.Select(d => d.Id).ToArray();

            var request = await _context.Requests
                .Include(r => r.Course)
                .Include(r => r.History)
                .Where(r => departmentIds.Contains(r.DepartmentId))
                .SingleAsync(x => x.Id == id);

            return View(request);
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
                .Where(r => r.IsActive)
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

            // process requested deletions first
            foreach (var m in model.Requests.Where(r => r.IsDeleted))
            {
                // find request by id
                var request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.Id == m.Id);

                // can't find the request being deleted
                if (request == null)
                {
                    return BadRequest("Could not find request to be deleted.");
                }

                request.IsActive = false;
            }

            // process updates next
            foreach (var m in model.Requests.Where(r => !r.IsDeleted))
            {
                var course = await _context.Courses.FindAsync(m.CourseNumber);

                // find request by id or name, or create a new one
                Request request = null;
                if (m.Id > 0)
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.Id == m.Id);
                }
                else
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r =>
                            string.Equals(r.CourseNumber, m.CourseNumber, StringComparison.OrdinalIgnoreCase));
                }

                // create request if necessary
                if (request == null)
                {
                    request = new Request()
                    {
                        DepartmentId             = department.Id,
                        CourseNumber             = course.Number,
                    };
                    _context.Requests.Add(request);
                }

                // update values
                request.IsActive                 = true;
                request.CourseType               = m.CourseType;
                request.RequestType              = m.RequestType;
                request.Exception                = m.Exception;
                request.ExceptionReason          = m.ExceptionReason;
                request.ExceptionTotal           = m.ExceptionTotal;
                request.ExceptionAnnualizedTotal = m.ExceptionAnnualizedTotal;
                request.CalculatedTotal          = m.CalculatedTotal;
                request.AnnualizedTotal          = m.AnnualizedTotal;
                request.UpdatedOn                = DateTime.UtcNow;
                request.UpdatedBy                = user.Name;

                // clear approval
                request.Approved = null;

                // auto approve any un-exception requests
                if (!request.Exception)
                {
                    request.Approved = true;
                }

                // always create a history entry, with this new data even on new entries, include course snapshot
                var history = new RequestHistory()
                {
                    RequestId                = request.Id,
                    DepartmentId             = department.Id,
                    UpdatedOn                = request.UpdatedOn,
                    UpdatedBy                = request.UpdatedBy,
                    CourseType               = request.CourseType,
                    RequestType              = request.RequestType,
                    Exception                = request.Exception,
                    ExceptionReason          = request.ExceptionReason,
                    ExceptionTotal           = request.ExceptionTotal,
                    ExceptionAnnualizedTotal = request.ExceptionAnnualizedTotal,
                    CalculatedTotal          = request.CalculatedTotal,
                    AnnualizedTotal          = request.AnnualizedTotal,
                    Approved                 = request.Approved,
                    CourseNumber             = course.Number,
                    AverageSectionsPerCourse = course.AverageSectionsPerCourse,
                    AverageEnrollment        = course.AverageEnrollment,
                    TimesOfferedPerYear      = course.TimesOfferedPerYear,
                };
                request.History.Add(history);
            }

            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }
    }
}
