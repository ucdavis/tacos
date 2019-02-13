using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Data;
using tacos.mvc.Models.SystemViewModels;
using tacos.mvc.Resources;
using tacos.mvc.services;

namespace tacos.mvc.Controllers
{
    [Authorize(Roles = RoleCodes.Admin)]
    public class SystemController : ApplicationController
    {
        private readonly TacoDbContext _dbContext;
        private readonly UserManager<User> _userManager;
        private readonly IDirectorySearchService _directorySearchService;

        public SystemController(TacoDbContext dbContext, UserManager<User> userManager, IDirectorySearchService directorySearchService)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _directorySearchService = directorySearchService;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> SystemUsers()
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

            var model = new UserRolesViewModel()
            {
                SystemRoles = systemRoles.ToList(),
            };

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> DepartmentUsers()
        {
            var departmentRoles = await _dbContext.DepartmentRoles
                .Include(r => r.Department)
                .Include(r => r.User)
                .AsNoTracking()
                .ToListAsync();

            var model = new DepartmentRolesViewModel()
            {
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

            return RedirectToAction(nameof(SystemUsers));
        }

        [HttpPost]
        public async Task<IActionResult> RemoveUserFromRole(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            await _userManager.RemoveFromRoleAsync(user, role);

            return RedirectToAction(nameof(SystemUsers));
        }

        [HttpPost]
        public async Task<IActionResult> AddUserToDepartmentRole(string userId, int departmentId)
        {
            // check for existing user first
            var user = await _userManager.FindByIdAsync(userId);

            // check for user on directory
            if (user == null)
            {
                var person = await _directorySearchService.GetByKerberos(userId);
                if (person == null)
                {
                    person = await _directorySearchService.GetByEmail(userId);
                }

                if (person == null)
                {
                    ErrorMessage = "User not found.";
                    return RedirectToAction(nameof(DepartmentUsers));
                }

                // create user and login
                var principal = new ClaimsPrincipal();
                var login = new ExternalLoginInfo(
                    principal,
                    AspNetCore.Security.CAS.CasDefaults.AuthenticationScheme,
                    person.Kerberos,
                    AspNetCore.Security.CAS.CasDefaults.DisplayName);
                    
                user = new User
                {
                    Id        = person.Kerberos,
                    Email     = person.Mail,
                    UserName  = person.Kerberos,
                    FirstName = person.GivenName,
                    LastName  = person.Surname,
                    Name      = person.FullName,
                };
                await _userManager.CreateAsync(user);
                await _userManager.AddLoginAsync(user, login);
            }

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

            return RedirectToAction(nameof(DepartmentUsers));
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

            return RedirectToAction(nameof(DepartmentUsers));
        }
    }
}
