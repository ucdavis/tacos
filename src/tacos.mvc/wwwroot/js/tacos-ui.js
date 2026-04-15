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

    function closeDialog(dialog) {
        if (dialog && dialog.open) {
            dialog.close();
        }
    }

    document.addEventListener("click", function (event) {
        var target = event.target instanceof Element ? event.target : null;

        if (!target) {
            return;
        }

        var dialogBackdrop = target.closest(".tacos-dialog__backdrop");

        if (dialogBackdrop) {
            closeDialog(dialogBackdrop.closest("dialog.tacos-dialog"));
            return;
        }

        if (target instanceof HTMLDialogElement && target.classList.contains("tacos-dialog")) {
            closeDialog(target);
            return;
        }

        var collapseButton = target.closest("[data-tacos-collapse-target]");

        if (collapseButton) {
            toggleCollapse(collapseButton);
            return;
        }

        var alertDismissButton = target.closest("[data-tacos-dismiss='alert']");

        if (alertDismissButton) {
            dismissAlert(alertDismissButton);
        }
    });
})();
