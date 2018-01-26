using Microsoft.EntityFrameworkCore;


namespace tacos.data
{
    public class TacoDbContext : DbContext
    {
        public TacoDbContext(DbContextOptions<TacoDbContext> options)
            : base(options)
        { }
        public virtual DbSet<Submission> Submissions { get; set; }

        public virtual DbSet<Request> Requests { get; set; }
    }
        
}
