using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Extensions;
using tacos.mvc.Models;
using tacos.mvc.services;

namespace tacos.mvc.Controllers
{
    public class RequestsController : ApplicationController
    {
        private readonly TacoDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;
        private readonly IRequestCalculationService _requestCalculationService;

        public RequestsController(
            TacoDbContext context,
            UserManager<User> userManager,
            IEmailService emailService,
            IRequestCalculationService requestCalculationService)
        {
            _context = context;
            _userManager = userManager;
            _emailService = emailService;
            _requestCalculationService = requestCalculationService;
        }

        // list submissions
        public async Task<IActionResult> Index(string code)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            var department = !string.IsNullOrWhiteSpace(code)
                ? departments.SingleOrDefault(d => d.Code == code)
                : departments.FirstOrDefault();

            if (department == null)
            {
                // could not find a valid department(s)
                return RedirectToAction(nameof(Empty));
            }

            ViewBag.Department = department;

            // get requests for department
            var requests = await _context.Requests
                .Include(r => r.Department)
                .Where(r => r.IsActive)
                .Where(r => r.Department.Id == department.Id)
                .AsNoTracking()
                .ToListAsync();

            return View(requests);
        }

        public new IActionResult Empty()
        {
            return View();
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
            
            [HttpPost]
           public async Task<IActionResult> Revoke(int id) 
           {
               var request = await _context.Requests.SingleAsync(r => r.Id == id);
               request.Approved = false;
               request.ApprovedComment = null;
               request.Submitted = false;
               request.SubmittedBy = null;
               request.SubmittedOn = null;

               await _context.SaveChangesAsync();
               return Json(new {success = true});
               
           }

        public async Task<IActionResult> Edit(int id, string code)
        {
            // get user's departments
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            ViewBag.Departments = departments;

            var department = !string.IsNullOrWhiteSpace(code)
                ? departments.SingleOrDefault(d => d.Code == code)
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
                .OrderBy(r => r.CourseNumber)
                .AsNoTracking()
                .ToArrayAsync();

            foreach (var request in requests)
            {
                ApplySupportTotals(
                    request,
                    _requestCalculationService.Calculate(
                        request.Course,
                        new RequestCalculationInput(
                            request.CourseType,
                            request.ExceptionTaTotal,
                            request.ExceptionReaderTotal,
                            request.ExceptionAnnualCount
                        )
                    )
                );
            }

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody]SubmissionModel model)
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
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Number == m.CourseNumber);

                // possible create new course
                if (course == null)
                {
                    course = new Course()
                    {
                        Number = m.CourseNumber,
                        Name = m.CourseName,
                        AverageEnrollment = 0,
                        AverageSectionsPerCourse = 0,
                        TimesOfferedPerYear = 0,
                    };
                    await _context.Courses.AddAsync(course);
                }

                // find request by id or name, or create a new one
                Request request;
                if (m.Id > 0)
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.Id == m.Id);
                }
                else
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.DepartmentId == model.DepartmentId &&
                            r.CourseNumber == m.CourseNumber);
                }

                // create request if necessary
                if (request == null)
                {
                    request = new Request()
                    {
                        DepartmentId = department.Id,
                        CourseNumber = course.Number,
                    };
                    _context.Requests.Add(request);
                }

                // if we have a new exception where there was not one previously, reset approval values
                if (m.Exception && !request.Exception) {
                    request.Approved = false;
                    request.ApprovedComment = null;
                }

                var supportTotals = _requestCalculationService.Calculate(
                    course,
                    new RequestCalculationInput(
                        m.CourseType,
                        m.ExceptionTaTotal,
                        m.ExceptionReaderTotal,
                        m.ExceptionAnnualCount
                    )
                );

                // update values
                request.IsActive                      = true;
                request.CourseType                    = m.CourseType;
                request.Exception                     = m.Exception;
                request.ExceptionReason               = m.ExceptionReason;
                request.ExceptionAnnualCount          = m.ExceptionAnnualCount;
                request.UpdatedOn                     = DateTime.UtcNow;
                request.UpdatedBy                     = user.UserName;
                ApplySupportTotals(request, supportTotals);

                // clean approval and submission info unless this already has an approved exception
                if (!request.HasApprovedException) {
                    request.Approved = null;
                    request.ApprovedComment = null;
                    request.Submitted = false;
                    request.SubmittedBy = null;
                    request.SubmittedOn = null;
                }
            }

            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> Recalculate([FromBody]RequestRecalculationModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            var departments = await _context.GetUsersDepartments(user);

            var department = departments.SingleOrDefault(d => d.Id == model.DepartmentId);
            if (department == null)
            {
                return BadRequest("Matching department not found among user's permission set.");
            }

            var course = await _context.Courses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Number == model.CourseNumber);

            if (course == null)
            {
                if (model.Course == null)
                {
                    return BadRequest("Course data required to calculate totals.");
                }

                course = new Course
                {
                    Number = string.IsNullOrWhiteSpace(model.Course.Number) ? model.CourseNumber : model.Course.Number,
                    Name = model.Course.Name,
                    AverageEnrollment = model.Course.AverageEnrollment,
                    AverageSectionsPerCourse = model.Course.AverageSectionsPerCourse,
                    TimesOfferedPerYear = model.Course.TimesOfferedPerYear,
                    WasCourseTaughtInMostRecentYear = model.Course.WasCourseTaughtInMostRecentYear,
                    IsCourseTaughtOnceEveryTwoYears = model.Course.IsCourseTaughtOnceEveryTwoYears,
                };
            }

            var supportTotals = _requestCalculationService.Calculate(
                course,
                new RequestCalculationInput(
                    model.CourseType,
                    model.ExceptionTaTotal,
                    model.ExceptionReaderTotal,
                    model.ExceptionAnnualCount
                )
            );

            return Json(new RequestRecalculationResultModel
            {
                CalculatedTaTotal = supportTotals.CalculatedTaTotal,
                CalculatedReaderTotal = supportTotals.CalculatedReaderTotal,
                AnnualizedTaTotal = supportTotals.AnnualizedTaTotal,
                AnnualizedReaderTotal = supportTotals.AnnualizedReaderTotal,
                ExceptionAnnualizedTaTotal = supportTotals.ExceptionAnnualizedTaTotal,
                ExceptionAnnualizedReaderTotal = supportTotals.ExceptionAnnualizedReaderTotal,
            });
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

            var now = DateTime.UtcNow;

            // save everything
            await Save(model);

            // process submissions next
            var requestsNeedingApproval = new List<Request>();
            foreach (var m in model.Requests.Where(r => !r.IsDeleted))
            {
                // find request by id or name, or create a new one
                Request request;
                if (m.Id > 0)
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.Id == m.Id);
                }
                else
                {
                    request = await _context.Requests
                        .FirstOrDefaultAsync(r => r.DepartmentId == model.DepartmentId &&
                            r.CourseNumber == m.CourseNumber);
                }

                // submit request
                request.Submitted = true;
                request.SubmittedOn = now;
                request.SubmittedBy = user.UserName;

                // auto approve any un-exception requests
                if (!request.Exception)
                {
                    request.Approved = true;
                }

                // add request to list if it needs approval
                if (!request.Approved.HasValue)
                {
                    requestsNeedingApproval.Add(request);
                }

                CreateRequestHistory(request);
            }

            await _context.SaveChangesAsync();

            // send emails
            try
            {
                if (requestsNeedingApproval.Any())
                {
                    await _emailService.SendSubmissionNotification(requestsNeedingApproval);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception throw while sending notification email.");
            }

            return Json(new { success = true });
        }

        private static void CreateRequestHistory(Request request)
        {
            var course = request.Course;

            var history = new RequestHistory()
            {
                RequestId                = request.Id,
                DepartmentId             = request.DepartmentId,
                UpdatedOn                = request.UpdatedOn,
                UpdatedBy                = request.UpdatedBy,
                CourseType               = request.CourseType,
                Exception                = request.Exception,
                ExceptionReason          = request.ExceptionReason,
                ExceptionTaTotal         = request.ExceptionTaTotal,
                ExceptionReaderTotal     = request.ExceptionReaderTotal,
                ExceptionAnnualCount     = request.ExceptionAnnualCount,
                ExceptionAnnualizedTaTotal = request.ExceptionAnnualizedTaTotal,
                ExceptionAnnualizedReaderTotal = request.ExceptionAnnualizedReaderTotal,
                CalculatedTaTotal        = request.CalculatedTaTotal,
                CalculatedReaderTotal    = request.CalculatedReaderTotal,
                AnnualizedTaTotal        = request.AnnualizedTaTotal,
                AnnualizedReaderTotal    = request.AnnualizedReaderTotal,
                Approved                 = request.Approved,
                ApprovedComment          = request.ApprovedComment,
                CourseNumber             = course.Number,
                AverageSectionsPerCourse = course.AverageSectionsPerCourse,
                AverageEnrollment        = course.AverageEnrollment,
                TimesOfferedPerYear      = course.TimesOfferedPerYear,
            };
            request.History.Add(history);
        }

        private static void ApplySupportTotals(Request request, RequestSupportTotals supportTotals)
        {
            request.ExceptionTaTotal = supportTotals.ExceptionTaTotal;
            request.ExceptionReaderTotal = supportTotals.ExceptionReaderTotal;
            request.ExceptionAnnualizedTaTotal = supportTotals.ExceptionAnnualizedTaTotal;
            request.ExceptionAnnualizedReaderTotal = supportTotals.ExceptionAnnualizedReaderTotal;
            request.CalculatedTaTotal = supportTotals.CalculatedTaTotal;
            request.CalculatedReaderTotal = supportTotals.CalculatedReaderTotal;
            request.AnnualizedTaTotal = supportTotals.AnnualizedTaTotal;
            request.AnnualizedReaderTotal = supportTotals.AnnualizedReaderTotal;
        }
    }
}
