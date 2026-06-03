(function () {
    "use strict";

    function getCollapseTarget(selector) {
        if (!selector) {
            return null;
        }

        return document.querySelector(selector);
    }

    function getCollapseButtons(target) {
        const targetId = target.getAttribute("id");

        if (!targetId) {
            return [];
        }

        return Array.from(document.querySelectorAll(`[data-tacos-collapse-target="#${targetId}"]`));
    }

    function syncOffcanvasBodyState() {
        const hasOpenOffcanvas = document.querySelector("[data-tacos-offcanvas].is-open") !== null;
        document.body.classList.toggle("tacos-nav-open", hasOpenOffcanvas);
    }

    function setCollapseState(target, isExpanded) {
        target.classList.toggle("is-open", isExpanded);

        getCollapseButtons(target).forEach((button) => {
            button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        });

        syncOffcanvasBodyState();
    }

    function closeCollapseTarget(target) {
        if (!target) {
            return;
        }

        setCollapseState(target, false);
    }

    function toggleCollapse(button) {
        const target = getCollapseTarget(button.getAttribute("data-tacos-collapse-target"));

        if (!target) {
            return;
        }

        const isExpanded = !target.classList.contains("is-open");
        setCollapseState(target, isExpanded);

        if (isExpanded && target.matches("[data-tacos-offcanvas]")) {
            const closeButton = target.querySelector("[data-tacos-collapse-close]");

            if (closeButton instanceof HTMLElement) {
                closeButton.focus();
            }
        }
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

        const collapseCloseButton = target.closest("[data-tacos-collapse-close]");

        if (collapseCloseButton) {
            closeCollapseTarget(getCollapseTarget(collapseCloseButton.getAttribute("data-tacos-collapse-close")));
            return;
        }

        const collapseButton = target.closest("[data-tacos-collapse-target]");

        if (collapseButton) {
            toggleCollapse(collapseButton);
            return;
        }

        const offcanvasLink = target.closest("[data-tacos-offcanvas] a");

        if (offcanvasLink && !window.matchMedia("(min-width: 1024px)").matches) {
            closeCollapseTarget(offcanvasLink.closest("[data-tacos-offcanvas]"));
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

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        document.querySelectorAll("[data-tacos-offcanvas].is-open").forEach(closeCollapseTarget);
    });

    const desktopNavigationQuery = window.matchMedia("(min-width: 1024px)");
    const closeOpenOffcanvas = () => {
        document.querySelectorAll("[data-tacos-offcanvas].is-open").forEach(closeCollapseTarget);
    };

    if (desktopNavigationQuery.addEventListener) {
        desktopNavigationQuery.addEventListener("change", closeOpenOffcanvas);
    } else {
        desktopNavigationQuery.addListener(closeOpenOffcanvas);
    }
})();
