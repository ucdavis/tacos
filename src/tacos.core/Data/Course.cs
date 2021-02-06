using System.ComponentModel.DataAnnotations;

namespace tacos.core.Data
{
    public class Course {
        // course number, ex: MAT110
        [Key]
        public string Number { get; set; }

        public string Name { get; set; }

        public string DeptName { get; set; }

        [DisplayFormat(DataFormatString = "0.##")]
        public double NonCrossListedAverageEnrollment { get; set; }

        [DisplayFormat(DataFormatString = "0.##")]
        public double AverageEnrollment { get; set; }

        [DisplayFormat(DataFormatString = "0.#")]
        public double AverageSectionsPerCourse { get; set; }

        [DisplayFormat(DataFormatString = "0.#")]
        public double TimesOfferedPerYear { get; set; }

        /// <summary>
        /// Indicates whether a course is co-listed in the course catalog under another Subject Code and Course Number.
        /// True indicates a course is co-listed, i.e. cross-listed; false if not.
        /// </summary>
        public bool IsCrossListed { get; set; }

        /// <summary>
        /// Contains the raw, un-parsed Cross Listing value from the course catalog (if present).
        /// This value will only be populated for co-listed, i.e., cross-listed, courses; NULL otherwise.
        /// </summary>
        public string CrossListingsString { get; set; }

        /// <summary>
        /// Indicates whether a course was offered within the past two (2) years.  This is because some ACTIVE
        /// courses captured from the course catalog that were not taught within the past two (2) years, may be taught
        /// in either the current or upcoming year. 
        /// That way the departments can readily pick the course from the data when they want to
        /// teach it again.
        /// True indicates a course was offered within the past two (2) years; false if not. 
        /// </summary>
        public bool IsOfferedWithinPastTwoYears { get; set; }

        /// <summary>
        /// Indicates whether a course was taught in the most recent of the two (2) years captured within the
        /// past two (2) year data set.  This flag is used on conjunction with the IsCourseTaughtOnceEveryTwoYears
        /// flag in order to determine if the current year is the year an every other year course is being taught.
        /// Usage: If IsCourseTaughtOnceEveryTwoYears = true and WasCourseTaughtInMostRecentYear = false
        /// then the current year is the year this course is being taught and the request for a TA would be appropriate.
        /// If IsCourseTaughtOnceEveryTwoYears = true and WasCourseTaughtInMostRecentYear = true then this course
        /// is not being taught until next year, and a request for a TA is not appropriate.
        /// </summary>
        public bool WasCourseTaughtInMostRecentYear { get; set; }

        /// <summary>
        /// Indicates whether a course is taught once every other year.  Used in conjunction with
        /// WasCourseTaughtInMostRecentYear.
        /// True indicates a course is only taught every other year; false if a course is taught every year.
        /// See comments associated with WasCourseTaughtInMostRecentYear to interpret usage.
        /// </summary>
        public bool IsCourseTaughtOnceEveryTwoYears { get; set; }
    }
}
