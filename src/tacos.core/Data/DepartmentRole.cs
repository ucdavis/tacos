using System.ComponentModel.DataAnnotations;

namespace tacos.core.Data
{
    public class DepartmentRole
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Department Department { get; set; }

        public int DepartmentId { get; set; }

        [Required]
        public User User { get; set; }

        public string UserId { get; set; }

        [Required]
        public string Role { get; set; }
    }
}
