using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using tacos.core.Data;
using tacos.core.Resources;

namespace tacos.core
{
    public class DbInitializer
    {
        private readonly TacoDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public DbInitializer(TacoDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task RecreateAndInitialize()
        {
            _context.Database.EnsureDeleted();

            await Initialize();
        }

        public async Task Initialize()
        {
            _context.Database.EnsureCreated();

            // seed basic information
            await CreateRoles();
            await CreateUsers();
            await CreateDepartments();

            _context.SaveChanges();
        }

        private async Task CreateDepartments()
        {
            var departments = new[]
            {
                new Department {Code = "AARE", Name = "Agricultural & Resource Economics"},
                new Department {Code = "AANS", Name = "Animal Science"},
                new Department {Code = "ABAE", Name = "Biological & Agricultural Engineering"},
                new Department {Code = "AENM", Name = "Entomology & Nematology"},
                new Department {Code = "ADES", Name = "Environmental Science & Policy"},
                new Department {Code = "AETX", Name = "Environmental Toxicology"},
                new Department {Code = "AFST", Name = "Food Science & Technology"},
                new Department {Code = "AHCE", Name = "Human Ecology"},
                new Department {Code = "ALAW", Name = "Land, Air & Water Resources"},
                new Department {Code = "ANUT", Name = "Nutrition"},
                new Department {Code = "APPA", Name = "Plant Pathology"},
                new Department {Code = "APLS", Name = "Plant Sciences"},
                new Department {Code = "ATXC", Name = "Textiles & Clothing"},
                new Department {Code = "AVIT", Name = "Viticulture & Enology"},
                new Department {Code = "AWFC", Name = "Wildlife, Fish & Conservation Biology"}
            };

            foreach (var department in departments)
            {
                await FindOrCreateDepartment(department);
            }
        }

        private async Task FindOrCreateDepartment(Department department)
        {
            var foundDepartment = await _context.Departments
                .SingleOrDefaultAsync(d => d.Code == department.Code);

            if (foundDepartment != null)
            {
                return;
            }

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
        }

        private void CreateCourses()
        {
            var lda2 = new Course
            {
                Number = "LDA002",
                Name = "Intro to LDA Placeholder",
                AverageEnrollment = 98,
                AverageSectionsPerCourse = 0,
                TimesOfferedPerYear = 20
            };


            var lda3 = new Course
            {
                Number = "LDA003",
                Name = "Advanced LDA Placeholder",
                AverageEnrollment = 138,
                AverageSectionsPerCourse = 7.5,
                TimesOfferedPerYear = 30
            };

            var lda170 = new Course
            {
                Number = "LDA170",
                Name = "LDA Ipsum",
                AverageEnrollment = 16,
                AverageSectionsPerCourse = 0,
                TimesOfferedPerYear = 10
            };

            _context.Courses.Add(lda2);
            _context.Courses.Add(lda3);
            _context.Courses.Add(lda170);
        }

        private async Task CreateRoles()
        {
            await FindOrCreateRole(new IdentityRole(RoleCodes.Admin));
            await FindOrCreateRole(new IdentityRole(RoleCodes.Reviewer));
            await FindOrCreateRole(new IdentityRole(RoleCodes.User));
        }

        private async Task FindOrCreateRole(IdentityRole role)
        {
            var foundRole = await _roleManager.FindByNameAsync(role.Name);
            if (foundRole != null)
            {
                return;
            }

            await _roleManager.CreateAsync(role);
        }

        private async Task CreateUsers()
        {
            var scottUser = new User
            {
                Email = "srkirkland@ucdavis.edu",
                UserName = "postit",
                Name = "Scott Kirkland",
                FirstName = "Scott",
                LastName = "Kirkland",
                Id = "postit"
            };
            await FindOrCreateUser(scottUser);

            var johnUser = new User()
            {
                Email = "jpknoll@ucdavis.edu",
                UserName = "jpknoll",
                Name = "John Knoll",
                Id = "jpknoll"
            };
            await FindOrCreateUser(johnUser);
        }

        private async Task FindOrCreateUser(User user)
        {
            var foundUser = await _userManager.FindByIdAsync(user.Id);
            if (foundUser != null)
            {
                return;
            }

            var principal = new ClaimsPrincipal();
            principal.AddIdentity(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name)
            }));

            var info = new ExternalLoginInfo(principal, "CAS", user.Id, null);

            await _userManager.CreateAsync(user);
            await _userManager.AddLoginAsync(user, info);
            await _userManager.AddToRoleAsync(user, RoleCodes.Admin);
            await _userManager.AddToRoleAsync(user, RoleCodes.Reviewer);
        }
    }
}
