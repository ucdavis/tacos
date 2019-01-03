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
            // get most all submissions
            var requests = await dbContext
                .Requests
                .Include(r => r.Course)
                .Where(r => r.IsActive)
                .OrderByDescending(s => s.UpdatedOn)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, string decision) {
            var request = await dbContext.Requests.SingleAsync(x=>x.Id == id);
            
            request.Approved = string.Equals(decision, "APPROVE", StringComparison.OrdinalIgnoreCase);

            await dbContext.SaveChangesAsync();

            return RedirectToAction("Index");
        }
    }
}
