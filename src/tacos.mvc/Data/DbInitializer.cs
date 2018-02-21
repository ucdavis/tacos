using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using tacos.mvc.Resources;

namespace tacos.data {
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

        public async Task Initialize() {

            _context.Database.EnsureCreated();

            await CreateRoles();

            await CreateUsers();

            CreateSubmissions();

            _context.SaveChanges();
        }

        private async Task CreateRoles()
        {
            await _roleManager.CreateAsync(new IdentityRole(RoleCodes.Admin));
            await _roleManager.CreateAsync(new IdentityRole(RoleCodes.User));
        }

        private async Task CreateUsers()
        {
            var scottUser = new User
            {
                Email = "srkirkland@ucdavis.edu",
                UserName = "postit",
                Name = "Scott Kirkland",
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

        private void CreateSubmissions()
        {
            var submission = new Submission { Actor = "postit" };
            var request = new Request { CourseNumber = "MAT16", CourseType = "STD", RequestType = "TA", CalculatedTotal = 2.5, Approved = true };
            var request2 = new Request { CourseNumber = "MAT17", CourseType = "LAB", RequestType = "TA", CalculatedTotal = 3.5, Contested = true, ContestReason = "Because I am special", ContestTotal = 5.25 };

            submission.Requests.Add(request);
            submission.Requests.Add(request2);

            _context.Submissions.Add(submission);
        }
    }
}