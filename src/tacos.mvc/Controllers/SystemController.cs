using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tacos.data;
using tacos.mvc.Resources;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = RoleCodes.Admin)]
    public class SystemController : ApplicationController
    {
        private readonly UserManager<User> _userManager;

        public SystemController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public ActionResult Roles()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> AddUserToRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.AddToRoleAsync(user, role);

            return new JsonResult(new
            {
                success = true
            });
        }

        [HttpPost]
        public async Task<ActionResult> RemoveUserFromRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.RemoveFromRoleAsync(user, role);

            return new JsonResult(new
            {
                success = true
            });
        }
    }
}
