(function () {
    "use strict";

    function toggleCollapse(button) {
        const targetSelector = button.getAttribute("data-tacos-collapse-target");

        if (!targetSelector) {
            return;
        }

        const target = document.querySelector(targetSelector);

        if (!target) {
            return;
        }

        const isExpanded = target.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    }

    function dismissAlert(button) {
        const alertElement = button.closest(".alert");

        if (alertElement) {
            alertElement.remove();
        }
    }

    function closeDialog(dialog) {
        if (dialog && dialog.open) {
            dialog.close();
        }
    }

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const dialogBackdrop = target.closest(".tacos-dialog__backdrop");

        if (dialogBackdrop) {
            closeDialog(dialogBackdrop.closest("dialog.tacos-dialog"));
            return;
        }

        if (target instanceof HTMLDialogElement && target.classList.contains("tacos-dialog")) {
            closeDialog(target);
            return;
        }

        const collapseButton = target.closest("[data-tacos-collapse-target]");

        if (collapseButton) {
            toggleCollapse(collapseButton);
            return;
        }

        const alertDismissButton = target.closest("[data-tacos-dismiss='alert']");

        if (alertDismissButton) {
            dismissAlert(alertDismissButton);
        }
    });
})();
