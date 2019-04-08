using System.ComponentModel.DataAnnotations;

namespace tacos.core.Data
{
    public class Course {
        // course number, ex: MAT110
        [Key]
        public string Number { get; set; }

        public string Name { get; set; }

        [DisplayFormat(DataFormatString = "0.#")]
        public double AverageSectionsPerCourse { get; set; }

        [DisplayFormat(DataFormatString = "0.##")]
        public double AverageEnrollment { get; set; }

        [DisplayFormat(DataFormatString = "0.#")]
        public double TimesOfferedPerYear { get; set; }
    }
}
