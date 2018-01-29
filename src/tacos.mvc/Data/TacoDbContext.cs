using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace tacos.data
{
    public class TacoDbContext : IdentityDbContext<User>
    {
        public TacoDbContext(DbContextOptions<TacoDbContext> options)
            : base(options)
        { }

        public new virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Submission> Submissions { get; set; }

        public virtual DbSet<Request> Requests { get; set; }
    }
        
}
