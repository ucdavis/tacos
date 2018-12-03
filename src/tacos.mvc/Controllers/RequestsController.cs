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
            var request = await context.Requests
                .SingleAsync(x => x.Id == id);

            return View(request);
        }

        public async Task<IActionResult> Create()
        {
            // get user's departments
            var user = await userManager.GetUserAsync(User);

            var departmentRoles = await context.DepartmentRoles
                .Where(r => r.User.Id == user.Id)
                .Include(r => r.Department)
                .AsNoTracking()
                .ToListAsync();

            ViewBag.Departments = departmentRoles
                .Select(r => r.Department)
                .Distinct()
                .ToList();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]SubmissionModel model)
        {
            // get user's departments
            var user = await userManager.GetUserAsync(User);

            var departmentRoles = await context.DepartmentRoles
                .Where(r => r.User.Id == user.Id)
                .Include(r => r.Department)
                .AsNoTracking()
                .ToListAsync();

            var departments = departmentRoles
                .Select(r => r.Department)
                .Distinct();

            // find matching department
            var department = departments.SingleOrDefault(d => d.Id == model.DepartmentId);
            if (department == null)
            {
                return BadRequest("Matching department not found among user's permission set.");
            }

            var creatorName = $"{user.LastName}, {user.FirstName}";

            var requests = model.Requests.Select(m => new Request
            {
                DepartmentId             = department.Id,
                CourseNumber             = m.Course.Number,
                CourseType               = m.CourseType,
                RequestType              = m.RequestType,
                Exception                = m.Exception,
                ExceptionReason          = m.ExceptionReason,
                ExceptionTotal           = m.ExceptionTotal,
                ExceptionAnnualizedTotal = m.ExceptionAnnualizedTotal,
                CalculatedTotal          = m.CalculatedTotal,
                AnnualizedTotal          = m.AnnualizedTotal,
                AverageSectionsPerCourse = m.Course.AverageSectionsPerCourse,
                AverageEnrollment        = m.Course.AverageEnrollment,
                TimesOfferedPerYear      = m.Course.TimesOfferedPerYear,
            }).ToArray();

            // auto approve any un-exception requests
            foreach (var request in requests)
            {
                if (!request.Exception)
                {
                    request.Approved = true;
                }
            }

            context.Requests.AddRange(requests);
            await context.SaveChangesAsync();

            return Json(new { success = true });
        }
    }
}