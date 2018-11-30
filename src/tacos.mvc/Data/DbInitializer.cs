using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using tacos.mvc.Data;
using tacos.mvc.Resources;

namespace tacos.data
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
            await _context.Database.EnsureDeletedAsync();

            await Initialize();
        }

        public async Task Initialize()
        {

            _context.Database.EnsureCreated();

            await CreateRoles();

            await CreateUsers();

            CreateDepartments();

            CreateCourses();

            _context.SaveChanges();
        }

        private void CreateDepartments()
        {
            _context.Departments.AddRange(
                new Department { Code = "AARE", Name = "Agricultural & Resource Economics" },
                new Department { Code = "AANS", Name = "Animal Science" },
                new Department { Code = "ABAE", Name = "Biological & Agricultural Engineering" },
                new Department { Code = "AENM", Name = "Entomology & Nematology" },
                new Department { Code = "ADES", Name = "Environmental Science & Policy" },
                new Department { Code = "AETX", Name = "Environmental Toxicology" },
                new Department { Code = "AFST", Name = "Food Science & Technology" },
                new Department { Code = "AHCE", Name = "Human Ecology" },
                new Department { Code = "ALAW", Name = "Land, Air & Water Resources" },
                new Department { Code = "ANUT", Name = "Nutrition" },
                new Department { Code = "APPA", Name = "Plant Pathology" },
                new Department { Code = "APLS", Name = "Plant Sciences" },
                new Department { Code = "ATXC", Name = "Textiles & Clothing" },
                new Department { Code = "AVIT", Name = "Viticulture & Enology" },
                new Department { Code = "AWFC", Name = "Wildlife, Fish & Conservation Biology" }
            );
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
            await _roleManager.CreateAsync(new IdentityRole(RoleCodes.Admin));
            await _roleManager.CreateAsync(new IdentityRole(RoleCodes.Reviewer));
            await _roleManager.CreateAsync(new IdentityRole(RoleCodes.User));
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

            var scottPrincipal = new ClaimsPrincipal();
            scottPrincipal.AddIdentity(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "postit"),
                new Claim(ClaimTypes.Name, "Scott Kirkland")
            }));

            var scottInfo = new ExternalLoginInfo(scottPrincipal, AspNetCore.Security.CAS.CasDefaults.AuthenticationScheme,
                "postit", null);

            await _userManager.CreateAsync(scottUser);
            await _userManager.AddLoginAsync(scottUser, scottInfo);
            await _userManager.AddToRoleAsync(scottUser, RoleCodes.Admin);
            await _userManager.AddToRoleAsync(scottUser, RoleCodes.Reviewer);

            var johnUser = new User()
            {
                Email = "jpknoll@ucdavis.edu",
                UserName = "jpknoll",
                Name = "John Knoll",
                Id = "jpknoll"
            };

            var johnPrincipal = new ClaimsPrincipal();
            johnPrincipal.AddIdentity(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "jpknoll"),
                new Claim(ClaimTypes.Name, "John Knoll"),
            }));

            var johnInfo = new ExternalLoginInfo(johnPrincipal, AspNetCore.Security.CAS.CasDefaults.AuthenticationScheme,
                "jpknoll", null);

            await _userManager.CreateAsync(johnUser);
            await _userManager.AddLoginAsync(johnUser, johnInfo);
            await _userManager.AddToRoleAsync(johnUser, RoleCodes.Admin);
        }
    }
}