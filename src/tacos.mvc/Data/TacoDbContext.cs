using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace tacos.data
{
    public class TacoDbContext : IdentityDbContext<User>
    {
        public TacoDbContext(DbContextOptions options)
            : base(options)
        { }

        public virtual DbSet<Submission> Submissions { get; set; }

        public virtual DbSet<Request> Requests { get; set; }
    }
        
}
