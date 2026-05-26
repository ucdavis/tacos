using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using tacos.core.Data;

namespace tacos.mvc.Models.CourseViewModels
{
    public class CourseDetailsViewModel
    {
        public Course Course { get; set; }

        public CourseDescription Description { get; set; }

        public IReadOnlyList<string> LearningActivities
        {
            get
            {
                if (Description == null)
                {
                    return Array.Empty<string>();
                }

                return new[]
                {
                    FormatLearningActivity(Description.FirstLearningActivity, Description.FirstContactHoursPeriod),
                    FormatLearningActivity(Description.SecondLearningActivity, Description.SecondContactHoursPeriod),
                    FormatLearningActivity(Description.ThirdLearningActivity, Description.ThirdContactHoursPeriod),
                    FormatLearningActivity(Description.FourthLearningActivity, Description.FourthContactHoursPeriod)
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
            }
        }

        public bool ShowWritingExperience =>
            IsWritingExperience(Description?.Ge3WritingExperience)
            || IsWritingExperience(Description?.Ge2WritingExperience);

        private static string FormatLearningActivity(string activity, string contactHoursPeriod)
        {
            if (string.IsNullOrWhiteSpace(activity))
            {
                return null;
            }

            var contactHours = FormatContactHours(contactHoursPeriod);
            return string.IsNullOrWhiteSpace(contactHours)
                ? activity.Trim()
                : $"{activity.Trim()} {contactHours}";
        }

        private static string FormatContactHours(string contactHoursPeriod)
        {
            if (string.IsNullOrWhiteSpace(contactHoursPeriod))
            {
                return null;
            }

            var trimmedContactHoursPeriod = contactHoursPeriod.Trim();
            var match = Regex.Match(
                trimmedContactHoursPeriod,
                @"^(?<hours>\d+(?:\.\d+)?)\s+Hours?/Week$",
                RegexOptions.IgnoreCase);

            if (!match.Success)
            {
                return trimmedContactHoursPeriod;
            }

            var hours = decimal.Parse(match.Groups["hours"].Value, CultureInfo.InvariantCulture);
            return $"{hours:0.##} hour(s)";
        }

        private static bool IsWritingExperience(string generalEducationValue)
        {
            return string.Equals(
                generalEducationValue?.Trim(),
                "Writing Experience",
                StringComparison.OrdinalIgnoreCase);
        }
    }
}
