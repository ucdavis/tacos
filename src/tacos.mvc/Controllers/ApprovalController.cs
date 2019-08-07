using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using tacos.core;
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
                .SingleAsync(x => x.Id == id);

            request.Approved = model.Approved;

            // build comment
            var comment = model.Comment;
            if (string.Equals(model.Comment, "other", StringComparison.OrdinalIgnoreCase)) {
                comment += $" - {model.CommentOther}";
            }
            
            request.ApprovedComment = comment;

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
    }
}
