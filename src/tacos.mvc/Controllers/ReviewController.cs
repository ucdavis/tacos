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
    [Authorize(Roles = "Reviewer")]
    public class ReviewController : ApplicationController
    {
        private readonly TacoDbContext dbContext;

        public ReviewController(TacoDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IActionResult> Index()
        {
            // get most all submissions
            var submissions = await dbContext
                .Submissions.OrderByDescending(s => s.Created)
                .Include(s => s.Requests)
                .AsNoTracking().ToArrayAsync();

            return View(submissions);
        }
    }
}
