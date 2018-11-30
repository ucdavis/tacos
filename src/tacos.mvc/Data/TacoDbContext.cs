using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tacos.mvc.Data;

namespace tacos.data
{
    public class TacoDbContext : IdentityDbContext<User>
    {
        public TacoDbContext(DbContextOptions options)
            : base(options)
        { }

        public virtual DbSet<Department> Departments { get; set; }

        public virtual DbSet<DepartmentRole> DepartmentRoles { get; set; }

        public virtual DbSet<Request> Requests { get; set; }

        public virtual DbSet<Course> Courses { get; set; }
    }
}
