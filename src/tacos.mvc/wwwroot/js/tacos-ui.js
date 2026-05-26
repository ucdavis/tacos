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

    function getFaqItems(root) {
        return Array.from(root.querySelectorAll("[data-tacos-faq-item]"));
    }

    function syncFaqToggle(root) {
        const toggleButton = root.querySelector("[data-tacos-faq-toggle]");

        if (!toggleButton) {
            return;
        }

        const items = getFaqItems(root);
        const allExpanded = items.length > 0 && items.every((item) => item.open);
        const labelAttribute = allExpanded ? "data-collapse-label" : "data-expand-label";
        const fallbackLabel = allExpanded ? "Collapse all" : "Expand all";

        toggleButton.textContent = toggleButton.getAttribute(labelAttribute) || fallbackLabel;
        toggleButton.setAttribute("aria-expanded", allExpanded ? "true" : "false");
    }

    function toggleFaqItems(button) {
        const root = button.closest("[data-tacos-faq]");

        if (!root) {
            return;
        }

        const items = getFaqItems(root);
        const shouldExpand = items.some((item) => !item.open);

        items.forEach((item) => {
            item.open = shouldExpand;
        });

        syncFaqToggle(root);
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

        const faqToggleButton = target.closest("[data-tacos-faq-toggle]");

        if (faqToggleButton) {
            toggleFaqItems(faqToggleButton);
            return;
        }

        const alertDismissButton = target.closest("[data-tacos-dismiss='alert']");

        if (alertDismissButton) {
            dismissAlert(alertDismissButton);
        }
    });

    document.addEventListener("toggle", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLDetailsElement) || !target.matches("[data-tacos-faq-item]")) {
            return;
        }

        const root = target.closest("[data-tacos-faq]");

        if (root) {
            syncFaqToggle(root);
        }
    }, true);
})();
