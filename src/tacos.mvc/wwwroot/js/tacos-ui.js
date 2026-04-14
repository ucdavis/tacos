(function () {
    "use strict";

    function toggleCollapse(button) {
        var targetSelector = button.getAttribute("data-tacos-collapse-target");

        if (!targetSelector) {
            return;
        }

        var target = document.querySelector(targetSelector);

        if (!target) {
            return;
        }

        var isExpanded = target.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    }

    function dismissAlert(button) {
        var alertElement = button.closest(".alert");

        if (alertElement) {
            alertElement.remove();
        }
    }

    document.addEventListener("click", function (event) {
        var collapseButton = event.target.closest("[data-tacos-collapse-target]");

        if (collapseButton) {
            toggleCollapse(collapseButton);
            return;
        }

        var alertDismissButton = event.target.closest("[data-tacos-dismiss='alert']");

        if (alertDismissButton) {
            dismissAlert(alertDismissButton);
        }
    });
})();
