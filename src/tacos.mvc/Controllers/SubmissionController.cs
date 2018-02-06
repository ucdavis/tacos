using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Models;

namespace tacos.mvc.Controllers
{
    public class SubmissionController : ApplicationController {
        private readonly TacoDbContext context;
        private readonly UserManager<User> userManager;

        public SubmissionController(TacoDbContext context, UserManager<User> userManager)
        {
            this.context = context;
            this.userManager = userManager;
        }


        // list submissions
        public async Task<IActionResult> Index() {
            var submissions = await context.Submissions
                .Where(x => x.Actor == User.Identity.Name).AsNoTracking().ToArrayAsync();

            return View(submissions);
        }

        public IActionResult Create() {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]SubmissionModel model) {
            var submission = new Submission {
                Actor = User.Identity.Name,
                Created = DateTime.UtcNow,
                Requests = model.Requests.Select(m => new Request {
                    CourseNumber = m.Course.Number,
                    CourseType = m.CourseType,
                    RequestType = m.RequestType,
                    Contested = m.Contested,
                    ContestReason = m.ContestReason,
                    CalculatedTotal = m.CalculatedTotal
                }).ToArray()
            };

            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            return Json(new { success = true });
        }
    }
}