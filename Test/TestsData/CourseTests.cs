using System.Collections.Generic;
using tacos.core.Data;
using TestHelpers.Helpers;
using Xunit;

namespace Test.TestsData
{
    [Trait("Category", "DatabaseTests")]
    public class CourseTests
    {
        [Fact]
        public void TestAllFieldsInTheDatabaseHaveBeenTested()
        {
            #region Arrange
            var expectedFields = new List<NameAndType>();
            expectedFields.Add(new NameAndType("AverageEnrollment", "System.Double", new List<string>()));
            expectedFields.Add(new NameAndType("AverageSectionsPerCourse", "System.Double", new List<string>()));
            expectedFields.Add(new NameAndType("Name", "System.String", new List<string>()));
            expectedFields.Add(new NameAndType("Number", "System.String", new List<string>
            {
                "[System.ComponentModel.DataAnnotations.KeyAttribute()]"
            }));


            #endregion Arrange

            AttributeAndFieldValidation.ValidateFieldsAndAttributes(expectedFields, typeof(Course));

        }
    }
}
