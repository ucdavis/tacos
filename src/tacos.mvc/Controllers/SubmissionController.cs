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

        public async Task<IActionResult> Details(int id) {
            // TODO: what permissions do we want?
            var submission = await context.Submissions.Include(s=>s.Requests).SingleAsync(x=>x.Id == id);

            return View(submission);
        }

        public IActionResult Create() {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody]SubmissionModel model) {
            var creator = await userManager.GetUserAsync(User);
            var creatorName = $"{creator.LastName}, {creator.FirstName}";
            
            var submission = new Submission {
                Actor = User.Identity.Name,
                ActorName = creatorName,
                Created = DateTime.UtcNow,
                Department = model.Department,
                Requests = model.Requests.Select(m => new Request {
                    CourseNumber = m.Course.Number,
                    CourseType = m.CourseType,
                    RequestType = m.RequestType,
                    Contested = m.Contested,
                    ContestReason = m.ContestReason,
                    ContestTotal = m.ContestTotal,
                    CalculatedTotal = m.CalculatedTotal,
                    AverageSectionsPerCourse = m.Course.AverageSectionsPerCourse,
                    AverageEnrollment = m.Course.AverageEnrollment
                }).ToArray()
            };

            // auto approve any uncontested requests
            foreach(var request in submission.Requests) {
                if (!request.Contested) {
                    request.Approved = true;
                }
            }

            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            return Json(new { success = true });
        }
    }
}