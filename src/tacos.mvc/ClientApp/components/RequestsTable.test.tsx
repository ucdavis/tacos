import * as React from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";

import RequestsTable from "./RequestsTable";

import type { ICourse } from "../models/ICourse";
import type { IRequest } from "../models/IRequest";

type RequestsTableProps = React.ComponentProps<typeof RequestsTable>;

function createCourse(overrides: Partial<ICourse> = {}): ICourse {
    return {
        averageEnrollment: 100,
        averageSectionsPerCourse: 1,
        crossListingsString: "",
        isCourseTaughtOnceEveryTwoYears: false,
        isCrossListed: false,
        isNew: false,
        isOfferedWithinPastTwoYears: true,
        name: "Introduction to Tacos",
        number: "TAC 010",
        timesOfferedPerYear: 1,
        wasCourseTaughtInMostRecentYear: true,
        ...overrides
    };
}

function createRequest(id: number, overrides: Partial<IRequest> = {}): IRequest {
    const courseOverrides = overrides.course || {};
    const course = overrides.course === undefined ? createCourse({ number: `TAC ${id.toString().padStart(3, "0")}` }) : createCourse(courseOverrides);

    return {
        id,
        course,
        courseName: course ? course.name : "",
        courseNumber: course ? course.number : "",
        courseType: "STD",
        calculatedTaTotal: 1,
        calculatedReaderTotal: 0,
        calculatedTotal: 1,
        annualizedTaTotal: 0.333,
        annualizedReaderTotal: 0,
        annualizedTotal: 0.333,
        exception: false,
        exceptionReason: "",
        exceptionTaTotal: 0,
        exceptionReaderTotal: 0,
        exceptionTotal: 0,
        exceptionAnnualCount: 0,
        exceptionAnnualizedTaTotal: 0,
        exceptionAnnualizedReaderTotal: 0,
        exceptionAnnualizedTotal: 0,
        hasApprovedException: false,
        isDirty: true,
        isValid: true,
        ...overrides
    };
}

function normalizeText(value: string | null | undefined): string {
    return (value || "").replace(/\s+/g, " ").trim();
}

function optionValues(select: HTMLSelectElement): string[] {
    return Array.from(select.options).map(option => option.value);
}

describe("RequestsTable UI coverage", () => {
    let host: HTMLDivElement | undefined;
    let root: Root | undefined;
    let props: RequestsTableProps | undefined;

    afterEach(async () => {
        if (root) {
            await act(async () => {
                root!.unmount();
            });
            root = undefined;
        }

        if (host) {
            host.remove();
            host = undefined;
        }

        props = undefined;
        vi.unstubAllGlobals();
    });

    async function renderTable(overrideProps: Partial<RequestsTableProps> = {}) {
        if (!host || !root || !props) {
            host = document.createElement("div");
            document.body.appendChild(host);

            vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
            root = createRoot(host);

            props = {
                className: "requests-table",
                requests: [],
                onEdit: vi.fn(),
                onRemove: vi.fn(),
                onRevoke: vi.fn(),
                onCourseCreate: vi.fn(),
            };
        }

        const nextProps: RequestsTableProps = {
            ...props,
            ...overrideProps,
        };
        props = nextProps;

        await act(async () => {
            root!.render(<RequestsTable {...nextProps} />);
        });

        return nextProps;
    }

    // just a simple wrapper to eliminate a bunch of TS warnings about potential uninitialized variable
    function getHost(): HTMLDivElement {
        if (!host) {
            throw new Error("Test host has not been initialized.");
        }

        return host;
    }

    function getVisibleRequestRows(): HTMLTableRowElement[] {
        return Array.from(getHost().querySelectorAll("tr[data-request-row='true'][id^='request-']")) as HTMLTableRowElement[];
    }

    function getVisibleRequestIds(): string[] {
        return getVisibleRequestRows().map(row => row.id);
    }

    function getCourseFilterInput(): HTMLInputElement {
        const input = getHost().querySelector("input[placeholder='Search ...']") as HTMLInputElement | null;

        expect(input).not.toBeNull();
        return input!;
    }

    function getCourseTypeCellSelect(scope: ParentNode = getHost()): HTMLSelectElement {
        const select = Array.from(scope.querySelectorAll("select")).find(element => {
            const values = optionValues(element as HTMLSelectElement);
            return values.includes("STD") && values.includes("MAN") && !values.includes("");
        }) as HTMLSelectElement | undefined;

        expect(select).toBeDefined();
        return select!;
    }

    function getExceptionFilterSelect(): HTMLSelectElement {
        const select = Array.from(getHost().querySelectorAll("select")).find(element => {
            const values = optionValues(element as HTMLSelectElement);
            return values.length === 3 && values[0] === "false" && values[1] === "true" && values[2] === "";
        }) as HTMLSelectElement | undefined;

        expect(select).toBeDefined();
        return select!;
    }

    function getExceptionCheckbox(scope: ParentNode = getHost()): HTMLInputElement {
        const checkbox = scope.querySelector("input[type='checkbox']") as HTMLInputElement | null;

        expect(checkbox).not.toBeNull();
        return checkbox!;
    }

    function getButtonByText(label: string, scope: ParentNode = document.body): HTMLButtonElement {
        const button = Array.from(scope.querySelectorAll("button")).find(
            element => normalizeText(element.textContent) === label
        ) as HTMLButtonElement | undefined;

        expect(button).toBeDefined();
        return button!;
    }

    function click(element: Element) {
        act(() => {
            element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    function setSelectValue(select: HTMLSelectElement, value: string) {
        act(() => {
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }

    function setCheckboxValue(checkbox: HTMLInputElement, checked: boolean) {
        if (checkbox.checked === checked) {
            return;
        }

        act(() => {
            checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
        const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

        expect(valueSetter).toBeDefined();

        act(() => {
            valueSetter!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        });
    }

    function getSortButton(columnId: string): HTMLButtonElement {
        const button = getHost().querySelector(
            `button[data-column-sort-button="${columnId}"]`
        ) as HTMLButtonElement | null;

        expect(button).not.toBeNull();
        return button!;
    }

    function getColumnHeader(label: string): HTMLTableCellElement {
        const header = Array.from(getHost().querySelectorAll("thead tr:first-child th")).find(
            element => normalizeText(element.textContent).includes(label)
        ) as HTMLTableCellElement | undefined;

        expect(header).toBeDefined();
        return header!;
    }

    it("renders only non-deleted rows and decorates focused rows with request ids", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 101", name: "Alpha" }) }),
                createRequest(2, { course: createCourse({ number: "TAC 102", name: "Bravo" }), isFocused: true }),
                createRequest(3, { course: createCourse({ number: "TAC 103", name: "Charlie" }), isDeleted: true }),
            ]
        });

        const currentHost = getHost();
        expect(getVisibleRequestIds()).toEqual(["request-1", "request-2"]);
        expect(currentHost.querySelector("#request-1")?.className).not.toContain("target-flash");
        expect(currentHost.querySelector("#request-2")?.className).toContain("target-flash");
        expect(normalizeText(currentHost.textContent)).not.toContain("Charlie");
    });

    it("filters rows through the course search input by number or name without case sensitivity", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "ECS 010", name: "Computer Architecture" }) }),
                createRequest(2, { course: createCourse({ number: "BIS 020", name: "Biology of Cells" }) }),
                createRequest(3, { course: createCourse({ number: "MAT 030", name: "Linear Algebra" }) }),
            ]
        });

        expect(getCourseFilterInput().getAttribute("aria-label")).toBe("Filter Course");
        expect(getExceptionFilterSelect().getAttribute("aria-label")).toBe("Filter Exception");

        await setInputValue(getCourseFilterInput(), "biology");
        expect(getVisibleRequestIds()).toEqual(["request-2"]);

        await setInputValue(getCourseFilterInput(), "ecs 010");
        expect(getVisibleRequestIds()).toEqual(["request-1"]);

        await setInputValue(getCourseFilterInput(), "");
        expect(getVisibleRequestIds()).toEqual(["request-1", "request-2", "request-3"]);
    });

    it("calls onRemove with the original request index when the visible row order changes", async () => {
        const onRemove = vi.fn();

        await renderTable({
            onRemove,
            requests: [
                createRequest(1, { course: createCourse({ number: "MAT 030", name: "Matrix Methods" }) }),
                createRequest(2, { course: createCourse({ number: "ECS 020", name: "Algorithms" }) }),
            ]
        });

        await click(getSortButton("course"));
        expect(getVisibleRequestIds()).toEqual(["request-2", "request-1"]);

        const secondRowRemoveButton = getHost().querySelector(
            "#request-2 [data-remove-request-button='true']"
        ) as HTMLButtonElement | null;
        expect(secondRowRemoveButton).not.toBeNull();

        await click(secondRowRemoveButton!);
        expect(onRemove).toHaveBeenCalledWith(1);
    });

    it("sorts the Course column by course number when the header is clicked", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 300", name: "Three Hundred" }) }),
                createRequest(2, { course: createCourse({ number: "TAC 020", name: "Twenty" }) }),
                createRequest(3, { course: createCourse({ number: "TAC 100", name: "One Hundred" }) }),
            ]
        });

        await click(getSortButton("course"));
        expect(getVisibleRequestIds()).toEqual(["request-2", "request-3", "request-1"]);
    });

    it("keeps unsaved rows at the bottom in insertion order when sorting", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 300", name: "Saved Three Hundred" }) }),
                createRequest(2, { course: createCourse({ number: "TAC 020", name: "Saved Twenty" }) }),
                createRequest(3, {
                    course: createCourse({ number: "TAC 100", name: "Unsaved One Hundred" }),
                    id: undefined,
                }),
                createRequest(4, {
                    course: createCourse({ number: "TAC 050", name: "Unsaved Fifty" }),
                    id: undefined,
                }),
            ]
        });

        await click(getSortButton("course"));
        expect(getVisibleRequestIds()).toEqual([
            "request-2",
            "request-1",
            "request-new-2",
            "request-new-3",
        ]);

        await click(getSortButton("course"));
        expect(getVisibleRequestIds()).toEqual([
            "request-1",
            "request-2",
            "request-new-2",
            "request-new-3",
        ]);
    });

    it("resizes adjacent columns from the divider handle and keeps the divider bound to the column on the left", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 101", name: "Alpha" }) }),
                createRequest(2, { course: createCourse({ number: "TAC 202", name: "Bravo" }) }),
            ]
        });

        const courseHeader = getColumnHeader("Course");
        const courseTypeHeader = getColumnHeader("Course Type");
        const resizer = getHost().querySelector(
            "[data-column-resizer='course']"
        ) as HTMLDivElement | null;
        const courseColumn = getHost().querySelector(
            "col[data-column-width='course']"
        ) as HTMLTableColElement | null;
        const courseTypeColumn = getHost().querySelector(
            "col[data-column-width='courseType']"
        ) as HTMLTableColElement | null;

        expect(resizer).not.toBeNull();
        expect(courseColumn).not.toBeNull();
        expect(courseTypeColumn).not.toBeNull();

        Object.defineProperty(courseHeader, "getBoundingClientRect", {
            configurable: true,
            value: () => ({
                bottom: 40,
                height: 40,
                left: 45,
                right: 285,
                toJSON: () => ({}),
                top: 0,
                width: 240,
                x: 45,
                y: 0,
            }),
        });
        Object.defineProperty(courseTypeHeader, "getBoundingClientRect", {
            configurable: true,
            value: () => ({
                bottom: 40,
                height: 40,
                left: 285,
                right: 425,
                toJSON: () => ({}),
                top: 0,
                width: 140,
                x: 285,
                y: 0,
            }),
        });

        act(() => {
            courseTypeHeader.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 330 }));
            document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 390 }));
            document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: 390 }));
        });

        expect(courseColumn!.style.width).toBe("");
        expect(courseTypeColumn!.style.width).toBe("");

        act(() => {
            resizer!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 289 }));
            document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 329 }));
            document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: 329 }));
        });

        expect(courseColumn!.style.width).toBe("280px");
        expect(courseTypeColumn!.style.width).toBe("100px");
    });

    it("keeps the criteria help link separate from sorting and hardens the external criteria link", async () => {
        await renderTable({
            requests: [
                createRequest(1),
                createRequest(2),
            ]
        });

        const criteriaInfoLink = Array.from(getHost().querySelectorAll("a")).find(
            element => normalizeText(element.textContent).includes("Criteria Info")
        ) as HTMLAnchorElement | undefined;

        expect(criteriaInfoLink).toBeDefined();
        expect(criteriaInfoLink!.getAttribute("rel")).toBe("noopener noreferrer");

        expect(getVisibleRequestIds()).toEqual(["request-1", "request-2"]);
    });

    it("filters rows with the exception dropdown and preserves the expanded exception detail", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 101", name: "Standard" }) }),
                createRequest(2, {
                    course: createCourse({ number: "TAC 202", name: "Exception Row" }),
                    exception: true,
                    exceptionReason: "Special staffing",
                    exceptionTaTotal: 1.5,
                    exceptionAnnualCount: 2
                }),
            ]
        });

        expect(getHost().querySelector("input[placeholder='TA FTE requested']")).not.toBeNull();
        expect(getHost().querySelector("input[placeholder='Reader FTE requested']")).not.toBeNull();

        await setSelectValue(getExceptionFilterSelect(), "true");
        expect(getVisibleRequestIds()).toEqual(["request-2"]);
        expect(getHost().querySelector("input[placeholder='TA FTE requested']")).not.toBeNull();

        await setSelectValue(getExceptionFilterSelect(), "false");
        expect(getVisibleRequestIds()).toEqual(["request-1"]);
        expect(getHost().querySelector("input[placeholder='TA FTE requested']")).toBeNull();
    });

    it("emits onEdit with updated request values from the original request index after sorting", async () => {
        const onEdit = vi.fn();

        const firstRequest = createRequest(1, {
            course: createCourse({ number: "TAC 250", name: "Later Row" }),
        });
        const secondRequest = createRequest(2, {
            course: createCourse({ number: "TAC 150", name: "Editable Row" }),
        });

        await renderTable({
            requests: [firstRequest, secondRequest],
            onEdit,
        });

        await click(getSortButton("course"));
        expect(getVisibleRequestIds()).toEqual(["request-2", "request-1"]);

        const sortedRow = getHost().querySelector("#request-2") as HTMLTableRowElement | null;
        expect(sortedRow).not.toBeNull();

        await setSelectValue(getCourseTypeCellSelect(sortedRow!), "MAN");
        await setCheckboxValue(getExceptionCheckbox(sortedRow!), true);

        expect(onEdit).toHaveBeenNthCalledWith(1, 1, { ...secondRequest, courseType: "MAN" });
        expect(onEdit).toHaveBeenNthCalledWith(2, 1, { ...secondRequest, exception: true });
    });

    it("forwards numeric edits from the expanded exception detail inputs and preserves textarea typing until blur saves it", async () => {
        const onEdit = vi.fn();

        const request = createRequest(7, {
            course: createCourse({ number: "TAC 207", name: "Exception Inputs" }),
            exception: true,
            exceptionReason: "Existing justification",
        });

        await renderTable({
            requests: [request],
            onEdit,
        });

        const currentHost = getHost();
        const totalInput = currentHost.querySelector("input[placeholder='TA FTE requested']") as HTMLInputElement | null;
        const readerInput = currentHost.querySelector("input[placeholder='Reader FTE requested']") as HTMLInputElement | null;
        const annualCountInput = currentHost.querySelector("input[placeholder='Annual offerings requested']") as HTMLInputElement | null;
        const reasonInput = currentHost.querySelector(
            "textarea[placeholder='Reason for exceptioning the course request']"
        ) as HTMLTextAreaElement | null;

        expect(totalInput).not.toBeNull();
        expect(readerInput).not.toBeNull();
        expect(annualCountInput).not.toBeNull();
        expect(reasonInput).not.toBeNull();

        await setInputValue(totalInput!, "2.25");
        await setInputValue(readerInput!, "0.50");
        await setInputValue(annualCountInput!, "3");

        const textareaValueSetter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value",
        )?.set;

        expect(textareaValueSetter).toBeDefined();

        act(() => {
            reasonInput!.focus();
            textareaValueSetter!.call(reasonInput!, "Updated justification");
            reasonInput!.dispatchEvent(new Event("input", { bubbles: true }));
            reasonInput!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        expect(onEdit).toHaveBeenNthCalledWith(1, 0, { ...request, exceptionTaTotal: 2.25 });
        expect(onEdit).toHaveBeenNthCalledWith(2, 0, { ...request, exceptionReaderTotal: 0.5 });
        expect(onEdit).toHaveBeenNthCalledWith(3, 0, { ...request, exceptionAnnualCount: 3 });
        expect(onEdit).toHaveBeenCalledTimes(3);
        expect(reasonInput!.value).toBe("Updated justification");

        act(() => {
            reasonInput!.blur();
            reasonInput!.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        });

        expect(onEdit).toHaveBeenNthCalledWith(4, 0, { ...request, exceptionReason: "Updated justification" });
        expect(reasonInput!.value).toBe("Updated justification");
    });

    it("renders new-course, validation, and every-other-year warning indicators", async () => {
        await renderTable({
            requests: [
                createRequest(1, {
                    course: createCourse({ number: "TAC 101", name: "New Course", isNew: true })
                }),
                createRequest(2, {
                    course: createCourse({ number: "TAC 202", name: "Invalid Course" }),
                    isValid: false,
                    error: "Course required"
                }),
                createRequest(3, {
                    course: createCourse({
                        number: "TAC 303",
                        name: "Alternating Course",
                        isCourseTaughtOnceEveryTwoYears: true,
                        wasCourseTaughtInMostRecentYear: false
                    }),
                    annualizedTaTotal: 0.5,
                    annualizedTotal: 0.5
                }),
            ]
        });

        const currentHost = getHost();
        const newIndicator = currentHost.querySelector("#request-new-indicator-0") as HTMLButtonElement | null;
        const validationWarning = currentHost.querySelector("#request-1-error") as HTMLButtonElement | null;
        const alternatingWarning = currentHost.querySelector("#request-2-ta-otheryear-warning") as HTMLButtonElement | null;

        expect(newIndicator).not.toBeNull();
        expect(newIndicator!.tagName).toBe("BUTTON");
        expect(newIndicator!.getAttribute("aria-describedby")).toMatch(/^tooltip-/);

        expect(validationWarning).not.toBeNull();
        expect(validationWarning!.tagName).toBe("BUTTON");
        expect(validationWarning!.getAttribute("aria-describedby")).toMatch(/^tooltip-/);

        expect(alternatingWarning).not.toBeNull();
        expect(alternatingWarning!.tagName).toBe("BUTTON");
        expect(alternatingWarning!.getAttribute("aria-describedby")).toMatch(/^tooltip-/);
        expect(normalizeText(currentHost.textContent)).toContain("0.500");
    });

    it("uses exception annualized totals for approved exceptions and forwards revoke actions", async () => {
        const onRevoke = vi.fn();

        await renderTable({
            onRevoke,
            requests: [
                createRequest(42, {
                    course: createCourse({
                        number: "TAC 420",
                        name: "Approved Exception",
                        isCourseTaughtOnceEveryTwoYears: true,
                        wasCourseTaughtInMostRecentYear: false
                    }),
                    annualizedTotal: 0.5,
                    exception: true,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTaTotal: 1.5,
                    exceptionAnnualizedTotal: 1.5,
                    hasApprovedException: true
                }),
            ]
        });

        const currentHost = getHost();
        const text = normalizeText(currentHost.textContent);

        expect(text).toContain("approved for the above course");
        expect(text).toContain("1.500");
        expect(currentHost.querySelector("#request-0-ta-otheryear-warning")).toBeNull();

        const revokeLink = currentHost.querySelector("#revoke-button") as HTMLButtonElement | null;
        expect(revokeLink).not.toBeNull();

        await click(revokeLink!);
        const modal = document.body.querySelector("[data-tacos-modal-dialog='true']") as HTMLElement | null;
        expect(modal).not.toBeNull();
        expect(normalizeText(document.body.textContent)).toContain("Please confirm");

        await click(getButtonByText("Revoke Approval", modal!));
        expect(onRevoke).toHaveBeenCalledWith(42);
    });

    it("restores the revoke button after an async revoke attempt settles", async () => {
        let resolveRevoke: (() => void) | undefined;
        const revokePromise = new Promise<void>((resolve) => {
            resolveRevoke = resolve;
        });
        const onRevoke = vi.fn(() => revokePromise);

        await renderTable({
            onRevoke,
            requests: [
                createRequest(42, {
                    course: createCourse({ number: "TAC 420", name: "Approved Exception" }),
                    exception: true,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTaTotal: 1.5,
                    exceptionAnnualizedTotal: 1.5,
                    hasApprovedException: true
                }),
            ]
        });

        const revokeLink = getHost().querySelector("#revoke-button") as HTMLButtonElement | null;
        expect(revokeLink).not.toBeNull();

        await click(revokeLink!);
        const modal = document.body.querySelector("[data-tacos-modal-dialog='true']") as HTMLElement | null;
        expect(modal).not.toBeNull();

        await click(getButtonByText("Revoke Approval", modal!));
        expect(normalizeText(modal!.textContent)).toContain("Revoking...");

        await act(async () => {
            resolveRevoke!();
            await revokePromise;
        });

        expect(normalizeText(modal!.textContent)).toContain("Revoke Approval");
    });
});
