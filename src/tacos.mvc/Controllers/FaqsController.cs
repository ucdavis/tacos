using Microsoft.AspNetCore.Mvc;

namespace tacos.mvc.Controllers
{
    public class FaqsController : ApplicationController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
