using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace tacos.data {
    public static class DbInitializer {
        public static async Task Initialize(TacoDbContext context, UserManager<User> userManager) {

            context.Database.EnsureDeleted(); // TODO: remove after testing
            context.Database.EnsureCreated();

            var scottUser = new User
            {
                Email = "srkirkland@ucdavis.edu",
                UserName = "postit",
                Name = "Scott Kirkland",
                Id = "postit"
            };

            var userPrincipal = new ClaimsPrincipal();
            userPrincipal.AddIdentity(new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, "postit"),
                new Claim(ClaimTypes.Name, "Scott Kirkland")
            }));

            var loginInfo = new ExternalLoginInfo(userPrincipal, AspNetCore.Security.CAS.CasDefaults.AuthenticationScheme, "postit", null);

            await userManager.CreateAsync(scottUser);
            await userManager.AddLoginAsync(scottUser, loginInfo);
 
            var submission = new Submission { Actor = "postit" };
            var request = new Request { CourseNumber = "MAT 16", CalculatedTotal = 20.5  };

            submission.Requests.Add(request);

            context.Submissions.Add(submission);
            context.SaveChanges();
        }
    }
}