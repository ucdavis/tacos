using System;
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
        private readonly TacoDbContext _dbContext;

        public ReviewController(TacoDbContext dbContext)
        {
            this._dbContext = dbContext;
        }

        public async Task<IActionResult> Index()
        {
            // get most all submissions
            var requests = await _dbContext.Requests
                .Include(r => r.Course)
                .Include(r => r.Department)
                .Where(r => r.IsActive)
                .AsNoTracking()
                .ToArrayAsync();

            return View(requests);
        }
    }
}
