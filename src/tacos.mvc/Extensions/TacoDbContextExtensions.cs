using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using tacos.data;
using tacos.mvc.Data;

namespace tacos.mvc.Extensions
{
    public static class TacoDbContextExtensions
    {
        public static async Task<IList<Department>> GetUsersDepartments(this TacoDbContext context, User user)
        {
            var departmentRoles = await context.DepartmentRoles
                .Where(r => r.User.Id == user.Id)
                .Include(r => r.Department)
                .AsNoTracking()
                .ToListAsync();

            var departments = departmentRoles
                .Select(r => r.Department)
                .Distinct()
                .ToList();

            return departments;
        }
    }
}
