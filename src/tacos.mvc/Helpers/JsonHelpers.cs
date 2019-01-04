using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace tacos.mvc.Helpers
{
    public class JsonHelpers
    {
        public static JsonSerializerSettings GetDefaultJsonSerializerSettings()
        {
            return new JsonSerializerSettings()
            {
                ContractResolver  = new CamelCasePropertyNamesContractResolver(),
                Formatting        = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore,
            };
        }
    }
}
