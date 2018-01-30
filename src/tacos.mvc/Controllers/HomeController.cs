using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace tacos.mvc.Controllers
{
    public class HomeController : ApplicationController
    {
        public IActionResult Index()
        {
            return View();
        }

        [AllowAnonymous] // maybe?
        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
