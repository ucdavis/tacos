using System.Linq;
using Shouldly;
using tacos.core.Data;
using tacos.mvc.Models.CourseViewModels;
using Xunit;

namespace Test.Models
{
    public class CourseDetailsViewModelTests
    {
        [Fact]
        public void LearningActivities_FormatsActivitiesWithWeeklyContactHours()
        {
            var model = new CourseDetailsViewModel
            {
                Description = new CourseDescription
                {
                    FirstLearningActivity = "Lecture",
                    FirstContactHoursPeriod = "3.0 Hours/Week",
                    SecondLearningActivity = "Laboratory",
                    SecondContactHoursPeriod = "3.0 Hours/Week",
                    ThirdLearningActivity = null,
                    ThirdContactHoursPeriod = " "
                }
            };

            model.LearningActivities.ShouldBe(new[]
            {
                "Lecture 3 hour(s)",
                "Laboratory 3 hour(s)"
            });
        }

        [Fact]
        public void LearningActivities_SkipsEmptyActivities()
        {
            var model = new CourseDetailsViewModel
            {
                Description = new CourseDescription
                {
                    FirstLearningActivity = " ",
                    FirstContactHoursPeriod = "3.0 Hours/Week",
                    SecondLearningActivity = "Seminar",
                    SecondContactHoursPeriod = "1.5 Hours/Week"
                }
            };

            model.LearningActivities.Single().ShouldBe("Seminar 1.5 hour(s)");
        }

        [Theory]
        [InlineData("Writing Experience", true)]
        [InlineData(" writing experience ", true)]
        [InlineData("Scientific Literacy", false)]
        [InlineData(null, false)]
        public void ShowWritingExperience_OnlyShowsWritingExperienceGeneralEducation(string ge3WritingExperience, bool expected)
        {
            var model = new CourseDetailsViewModel
            {
                Description = new CourseDescription
                {
                    Ge3ScienceEngineering = "Science & Engineering",
                    Ge3ScientificLiteracy = "Scientific Literacy",
                    Ge3VisualLiteracy = "Visual Literacy",
                    Ge3WritingExperience = ge3WritingExperience
                }
            };

            model.ShowWritingExperience.ShouldBe(expected);
        }

        [Fact]
        public void ShowWritingExperience_FallsBackToGe2WritingExperience()
        {
            var model = new CourseDetailsViewModel
            {
                Description = new CourseDescription
                {
                    Ge2WritingExperience = "Writing Experience",
                    Ge3WritingExperience = null
                }
            };

            model.ShowWritingExperience.ShouldBeTrue();
        }
    }
}
