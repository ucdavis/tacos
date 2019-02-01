using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Models.ApprovalViewModels;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ApprovalController : ApplicationController
    {
        private readonly TacoDbContext _dbContext;

        public ApprovalController(TacoDbContext dbContext)
        {
            _dbContext = dbContext;
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
            request.ApprovedComment = model.Comment;

            await _dbContext.SaveChangesAsync();

            return RedirectToAction("Index");
        }
    }
}
