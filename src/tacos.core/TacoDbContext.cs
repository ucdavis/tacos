using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tacos.core.Data;

namespace tacos.core
{
    public class TacoDbContext : IdentityDbContext<User>
    {
        public TacoDbContext(DbContextOptions options)
            : base(options)
        { }

        public virtual DbSet<Course> Courses { get; set; }

        public virtual  DbSet<CourseDescription> CourseDescriptions { get; set; }

        public virtual DbSet<Department> Departments { get; set; }

        public virtual DbSet<DepartmentRole> DepartmentRoles { get; set; }

        public virtual DbSet<Request> Requests { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            CourseDescription.OnModelCreating(builder);

            Request.OnModelCreating(builder);
        }
    }
}
