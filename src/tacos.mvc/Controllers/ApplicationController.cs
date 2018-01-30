using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace tacos.mvc.Controllers
{
    [Authorize]
    public abstract class ApplicationController : Controller { }
}