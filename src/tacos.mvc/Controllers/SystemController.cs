using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Data;
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
        public async Task<IActionResult> Users()
        {
            var users = _dbContext.Users.ToList();

            var admins = (await _userManager.GetUsersInRoleAsync(RoleCodes.Admin));
            var reviewers = (await _userManager.GetUsersInRoleAsync(RoleCodes.Reviewer));

            var systemRoles = from u in users
                              join a in admins
                              on u.Id equals a.Id into gj
                              join r in reviewers
                              on u.Id equals r.Id into rj
                              from match in gj.DefaultIfEmpty()
                              from match2 in rj.DefaultIfEmpty()
                              select new SystemRoleViewModel()
                              {
                                  User = u,
                                  IsAdmin = (match != null),
                                  IsReviewer = (match2 != null),
                              };

            var departmentRoles = await _dbContext.DepartmentRoles
                .Include(r => r.Department)
                .Include(r => r.User)
                .AsNoTracking()
                .ToListAsync();

            var model = new UserRolesViewModel()
            {
                SystemRoles = systemRoles.ToList(),
                DepartmentRoles = departmentRoles,
            };

            ViewBag.Departments = await _dbContext.Departments
                .OrderBy(d => d.Name)
                .AsNoTracking()
                .ToListAsync();

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddUserToRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.AddToRoleAsync(user, role);

            return RedirectToAction(nameof(Users));
        }

        [HttpPost]
        public async Task<IActionResult> RemoveUserFromRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.RemoveFromRoleAsync(user, role);

            return RedirectToAction(nameof(Users));
        }

        [HttpPost]
        public async Task<IActionResult> AddUserToDepartmentRole(string userId, int departmentId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            var department = await _dbContext.Departments
                .Include(d => d.MemberRoles)
                .FirstOrDefaultAsync(d => d.Id == departmentId);

            _dbContext.DepartmentRoles.Add(new DepartmentRole()
            {
                User = user,
                Department = department,
                Role = "Member",
            });

            await _dbContext.SaveChangesAsync();

            return RedirectToAction(nameof(Users));
        }

        [HttpPost]
        public async Task<IActionResult> RemoveUserToDepartmentRole(string userId, int departmentId)
        {
            var role = await _dbContext.DepartmentRoles
                .FirstOrDefaultAsync(r => r.UserId == userId && r.DepartmentId == departmentId);

            if (role == null)
            {
                return NotFound();
            }

            _dbContext.DepartmentRoles.Remove(role);

            await _dbContext.SaveChangesAsync();

            return RedirectToAction(nameof(Users));
        }
    }
}
