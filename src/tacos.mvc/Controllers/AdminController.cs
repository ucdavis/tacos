using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : ApplicationController
    {
        private readonly TacoDbContext dbContext;

        public AdminController(TacoDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IActionResult> Index()
        {
            // get most recent submissions
            var submissions = await dbContext
                .Submissions.OrderByDescending(s => s.Created).Take(100)
                .AsNoTracking().ToArrayAsync();

            return View(submissions);
        }

        public async Task<IActionResult> Edit(int id) {
            // edit a specific submission
            var submission = await dbContext.Submissions
                .Include(s=>s.Requests).AsNoTracking().SingleAsync(x=>x.Id == id);

            return View(submission);
        }

        [HttpPost]
        public IActionResult Edit(string decision) {
            return Json(decision);
        }
    }
}
