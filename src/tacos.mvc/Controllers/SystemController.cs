using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tacos.data;
using tacos.mvc.Models.SystemViewModels;
using tacos.mvc.Resources;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = RoleCodes.Admin)]
    public class SystemController : ApplicationController
    {
        private readonly TacoDbContext _dbContext;
        private readonly UserManager<User> _userManager;

        public SystemController(TacoDbContext dbContext, UserManager<User> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult> Users()
        {
            var users = _dbContext.Users.ToList();

            var admins = (await _userManager.GetUsersInRoleAsync(RoleCodes.Admin));

            var joined = from u in users
                         join a in admins
                         on u.Id equals a.Id into gj
                         from match in gj.DefaultIfEmpty()
                         select new UserRoleViewModel
                         {
                             User = u,
                             IsAdmin = (match != null)
                         };

            return View(joined.ToList());
        }

        [HttpPost]
        public async Task<ActionResult> AddUserToRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.AddToRoleAsync(user, role);

            return RedirectToAction(nameof(Users));
        }

        [HttpPost]
        public async Task<ActionResult> RemoveUserFromRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.RemoveFromRoleAsync(user, role);

            return RedirectToAction(nameof(Users));
        }
    }
}
