using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using tacos.core;
using tacos.core.Data;
using tacos.mvc.Models.ApprovalViewModels;
using tacos.mvc.services;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ApprovalController : ApplicationController
    {
        private readonly TacoDbContext _dbContext;
        private readonly IEmailService _emailService;

        public ApprovalController(TacoDbContext dbContext, IEmailService emailService)
        {
            _dbContext = dbContext;
            _emailService = emailService;
        }

        public async Task<IActionResult> Index()
        {
            // get most all submissions
            var requests = await _dbContext
                .Requests
                .Include(r => r.Course)
                .Include(r => r.Department)
                .Where(r => r.IsActive)
                .Where(r => r.Submitted)
                .Where(r => r.Approved == null)
                .OrderByDescending(s => s.UpdatedOn)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, ApprovalDecisionViewModel model)
        {
            var request = await _dbContext
                .Requests
                .Include(r => r.Course)
                .SingleAsync(x => x.Id == id);

            request.Approved = model.Approved;

            // build comment
            var comment = model.Comment;
            if (string.Equals(model.Comment, "other", StringComparison.OrdinalIgnoreCase)) {
                comment += $" - {model.CommentOther}";
            }
            
            request.ApprovedComment = comment;

            CreateApprovalHistory(request);

            var notificationRequest = request.ShallowCopy();

            // on denial, turn this back into non-exception
            if (request.Approved.HasValue && request.Approved.Value == false) {
                request.Exception = false;
                request.Approved = true;
            }

            await _dbContext.SaveChangesAsync();

            // send emails
            try
            {
                await _emailService.SendApprovalNotification(notificationRequest);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception throw while sending notification email.");
            }

            return RedirectToAction("Index");
        }

        private static void CreateApprovalHistory(Request request)
        {
            var course = request.Course;

            var history = new RequestHistory()
            {
                RequestId = request.Id,
                DepartmentId = request.DepartmentId,
                UpdatedOn = request.UpdatedOn,
                UpdatedBy = request.UpdatedBy,
                CourseType = request.CourseType,
                RequestType = request.RequestType,
                Exception = request.Exception,
                ExceptionReason = request.ExceptionReason,
                ExceptionTotal = request.ExceptionTotal,
                ExceptionAnnualizedTotal = request.ExceptionAnnualizedTotal,
                CalculatedTotal = request.CalculatedTotal,
                AnnualizedTotal = request.AnnualizedTotal,
                Approved = request.Approved,
                ApprovedComment = request.ApprovedComment,
                CourseNumber = course.Number,
                AverageSectionsPerCourse = course.AverageSectionsPerCourse,
                AverageEnrollment = course.AverageEnrollment,
                TimesOfferedPerYear = course.TimesOfferedPerYear,
            };
            request.History.Add(history);
        }
    }
}
