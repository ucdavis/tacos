using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace tacos.mvc.Controllers
{
    [Authorize]
    public abstract class ApplicationController : Controller
    {
        [TempData(Key = "Message")]
        public string Message { get; set; }

        [TempData(Key = "ErrorMessage")]
        public string ErrorMessage { get; set; }
    }
}
