using System;
using System.Collections.Generic;
using System.Text;
using tacos.data;

namespace Test.Helpers
{
    public static class CreateValidEntities
    {
        public static Course Course(int? counter, bool populateAllFields = false)
        {
            var rtValue = new Course();
            rtValue.Number = $"Number{counter}";
            
            if (populateAllFields)
            {
                rtValue.Name = $"Name{counter}";
                rtValue.AverageSectionsPerCourse = 0.0 + counter ?? 99;
                rtValue.AverageEnrollment = counter ?? 99;
            }
            return rtValue;
        }
    }
}
