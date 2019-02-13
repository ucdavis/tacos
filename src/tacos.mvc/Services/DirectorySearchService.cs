using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ietws;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Serilog;
using tacos.mvc.Models;

namespace tacos.mvc.services {
    public interface IDirectorySearchService
    {
        Task<Person> GetByEmail(string email);
        Task<Person> GetByKerberos(string kerb);
    }

    public class IetWsSearchService : IDirectorySearchService
    {
        private readonly IetClient ietClient;

        public IetWsSearchService(IOptions<CommonSettings> configuration)
        {
            var settings = configuration.Value;
            ietClient = new IetClient(settings.IetWsKey);
        }

        public async Task<Person> GetByEmail(string email)
        {
            // find the contact via their email
            var ucdContactResult = await ietClient.Contacts.Search(ContactSearchField.email, email);
            if (ucdContactResult.ResponseStatus != 0 || !ucdContactResult.ResponseData.Results.Any())
            {
                Log.ForContext("email", email)
                    .ForContext("response", ucdContactResult, true)
                    .Warning("User not found");

                return null;
            }

            var ucdContact = ucdContactResult.ResponseData.Results.First();

            // now look up the whole person's record by ID including kerb
            var ucdKerbResult = await ietClient.Kerberos.Search(KerberosSearchField.iamId, ucdContact.IamId);

            if (ucdKerbResult.ResponseStatus != 0 || !ucdKerbResult.ResponseData.Results.Any())
            {
                Log.ForContext("email", email)
                   .ForContext("response", ucdKerbResult, true)
                   .Warning("User not found");

                return null;
            }

            var ucdKerbPerson = ucdKerbResult.ResponseData.Results.Single();
            return new Person
            {
                GivenName = ucdKerbPerson.DFirstName,
                Surname = ucdKerbPerson.DLastName,
                FullName = ucdKerbPerson.DFullName,
                Kerberos = ucdKerbPerson.UserId,
                Mail = ucdContact.Email
            };
        }

        public async Task<Person> GetByKerberos(string kerb)
        {
            var ucdKerbResult = await ietClient.Kerberos.Search(KerberosSearchField.userId, kerb);
            if (ucdKerbResult.ResponseStatus != 0 || !ucdKerbResult.ResponseData.Results.Any())
            {
                Log.ForContext("kerb", kerb)
                    .ForContext("response", ucdKerbResult, true)
                    .Warning("User not found");

                return null;
            }

            var ucdKerbPerson = ucdKerbResult.ResponseData.Results.Single();

            // find their email
            var ucdContactResult = await ietClient.Contacts.Get(ucdKerbPerson.IamId);
            if (ucdContactResult.ResponseStatus != 0 || !ucdContactResult.ResponseData.Results.Any())
            {
                Log.ForContext("kerb", kerb)
                    .ForContext("response", ucdContactResult, true)
                    .Warning("User not found");

                return null;
            }

            var ucdContact = ucdContactResult.ResponseData.Results.First();

            return new Person
            {
                GivenName = ucdKerbPerson.DFirstName,
                Surname = ucdKerbPerson.DLastName,
                FullName = ucdKerbPerson.DFullName,
                Kerberos = ucdKerbPerson.UserId,
                Mail = ucdContact.Email
            };
        }
    }
}
