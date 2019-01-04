using System;
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
        private readonly TacoDbContext _dbContext;

        public AdminController(TacoDbContext dbContext)
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
                .OrderByDescending(s => s.UpdatedOn)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, string decision)
        {
            var request = await _dbContext
                .Requests
                .SingleAsync(x => x.Id == id);
            
            request.Approved = string.Equals(decision, "APPROVE", StringComparison.OrdinalIgnoreCase);

            await _dbContext.SaveChangesAsync();

            return RedirectToAction("Index");
        }
    }
}
