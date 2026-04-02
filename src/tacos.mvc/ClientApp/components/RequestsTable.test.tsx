import * as React from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";

vi.mock("reactstrap", async (importOriginal) => {
    const actual = await importOriginal<typeof import("reactstrap")>();

    return {
        ...actual,
        Tooltip: () => null,
        Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen?: boolean }) => isOpen ? <div>{children}</div> : null,
        ModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Button: ({
            children,
            onClick,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} {...props}>{children}</button>,
        NavLink: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
    };
});

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
        requestType: "TA",
        calculatedTotal: 1,
        annualizedTotal: 0.333,
        exception: false,
        exceptionReason: "",
        exceptionTotal: 0,
        exceptionAnnualCount: 0,
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

        props = {
            ...props,
            ...overrideProps,
        };

        await act(async () => {
            root!.render(<RequestsTable {...props} />);
        });

        return props;
    }

    function getVisibleRequestRows(): HTMLDivElement[] {
        return Array.from(host!.querySelectorAll("div.rt-tr[id^='request-']")) as HTMLDivElement[];
    }

    function getVisibleRequestIds(): string[] {
        return getVisibleRequestRows().map(row => row.id);
    }

    function getCourseFilterInput(): HTMLInputElement {
        const input = host!.querySelector("input[placeholder='Search ...']") as HTMLInputElement | null;

        expect(input).not.toBeNull();
        return input!;
    }

    function getCourseTypeCellSelect(): HTMLSelectElement {
        const select = Array.from(host!.querySelectorAll("select")).find(element => {
            const values = optionValues(element as HTMLSelectElement);
            return values.includes("STD") && values.includes("MAN") && !values.includes("");
        }) as HTMLSelectElement | undefined;

        expect(select).toBeDefined();
        return select!;
    }

    function getRequestTypeCellSelect(): HTMLSelectElement {
        const select = Array.from(host!.querySelectorAll("select")).find(element => {
            const values = optionValues(element as HTMLSelectElement);
            return values.length === 2 && values[0] === "TA" && values[1] === "READ";
        }) as HTMLSelectElement | undefined;

        expect(select).toBeDefined();
        return select!;
    }

    function getExceptionFilterSelect(): HTMLSelectElement {
        const select = Array.from(host!.querySelectorAll("select")).find(element => {
            const values = optionValues(element as HTMLSelectElement);
            return values.length === 3 && values[0] === "false" && values[1] === "true" && values[2] === "";
        }) as HTMLSelectElement | undefined;

        expect(select).toBeDefined();
        return select!;
    }

    function getButtonByText(label: string): HTMLButtonElement {
        const button = Array.from(document.body.querySelectorAll("button")).find(
            element => normalizeText(element.textContent) === label
        ) as HTMLButtonElement | undefined;

        expect(button).toBeDefined();
        return button!;
    }

    async function click(element: Element) {
        await act(async () => {
            element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    async function setSelectValue(select: HTMLSelectElement, value: string) {
        await act(async () => {
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }

    async function setCheckboxValue(checkbox: HTMLInputElement, checked: boolean) {
        if (checkbox.checked === checked) {
            return;
        }

        await act(async () => {
            checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    async function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
        const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

        expect(valueSetter).toBeDefined();

        await act(async () => {
            valueSetter!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        });
    }

    function getCourseHeader(): HTMLElement {
        const header = Array.from(host!.querySelectorAll(".rt-th")).find(
            element => normalizeText(element.textContent) === "Course"
        ) as HTMLElement | undefined;

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

        expect(getVisibleRequestIds()).toEqual(["request-1", "request-2"]);
        expect(host.querySelector("#request-1")?.className).not.toContain("target-flash");
        expect(host.querySelector("#request-2")?.className).toContain("target-flash");
        expect(normalizeText(host.textContent)).not.toContain("Charlie");
    });

    it("filters rows through the course search input by number or name without case sensitivity", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "ECS 010", name: "Computer Architecture" }) }),
                createRequest(2, { course: createCourse({ number: "BIS 020", name: "Biology of Cells" }) }),
                createRequest(3, { course: createCourse({ number: "MAT 030", name: "Linear Algebra" }) }),
            ]
        });

        await setInputValue(getCourseFilterInput(), "biology");
        expect(getVisibleRequestIds()).toEqual(["request-2"]);

        await setInputValue(getCourseFilterInput(), "ecs 010");
        expect(getVisibleRequestIds()).toEqual(["request-1"]);

        await setInputValue(getCourseFilterInput(), "");
        expect(getVisibleRequestIds()).toEqual(["request-1", "request-2", "request-3"]);
    });

    it("calls onRemove with the rendered row index when the remove button is clicked", async () => {
        const onRemove = vi.fn();

        await renderTable({
            onRemove,
            requests: [
                createRequest(1, { course: createCourse({ number: "ECS 020", name: "Algorithms" }) }),
                createRequest(2, { course: createCourse({ number: "MAT 030", name: "Matrix Methods" }) }),
            ]
        });

        const secondRowRemoveButton = host!.querySelector("#request-2 .btn-danger") as HTMLButtonElement | null;
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

        const header = getCourseHeader();

        await click(header);
        expect(getVisibleRequestIds()).toEqual(["request-2", "request-3", "request-1"]);
    });

    it("filters rows with the exception dropdown and preserves the expanded exception detail", async () => {
        await renderTable({
            requests: [
                createRequest(1, { course: createCourse({ number: "TAC 101", name: "Standard" }) }),
                createRequest(2, {
                    course: createCourse({ number: "TAC 202", name: "Exception Row" }),
                    exception: true,
                    exceptionReason: "Special staffing",
                    exceptionTotal: 1.5,
                    exceptionAnnualCount: 2
                }),
            ]
        });

        expect(host.querySelector("input[placeholder='Total FTE requested']")).not.toBeNull();

        await setSelectValue(getExceptionFilterSelect(), "true");
        expect(getVisibleRequestIds()).toEqual(["request-2"]);
        expect(host.querySelector("input[placeholder='Total FTE requested']")).not.toBeNull();

        await setSelectValue(getExceptionFilterSelect(), "false");
        expect(getVisibleRequestIds()).toEqual(["request-1"]);
        expect(host.querySelector("input[placeholder='Total FTE requested']")).toBeNull();
    });

    it("emits onEdit with updated request values from the row controls", async () => {
        const onEdit = vi.fn();

        const request = createRequest(1, {
            course: createCourse({ number: "TAC 150", name: "Editable Row" }),
        });

        await renderTable({
            requests: [request],
            onEdit,
        });

        await setSelectValue(getCourseTypeCellSelect(), "MAN");
        await setSelectValue(getRequestTypeCellSelect(), "READ");

        const exceptionCheckbox = host.querySelector("input[type='checkbox']") as HTMLInputElement | null;
        expect(exceptionCheckbox).not.toBeNull();

        await setCheckboxValue(exceptionCheckbox!, true);

        expect(onEdit).toHaveBeenNthCalledWith(1, 0, { ...request, courseType: "MAN" });
        expect(onEdit).toHaveBeenNthCalledWith(2, 0, { ...request, requestType: "READ" });
        expect(onEdit).toHaveBeenNthCalledWith(3, 0, { ...request, exception: true });
    });

    it("forwards numeric edits from the expanded exception detail inputs and renders the reason field", async () => {
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

        const totalInput = host.querySelector("input[placeholder='Total FTE requested']") as HTMLInputElement | null;
        const annualCountInput = host.querySelector("input[placeholder='Annual offerings requested']") as HTMLInputElement | null;
        const reasonInput = host.querySelector(
            "textarea[placeholder='Reason for exceptioning the course request']"
        ) as HTMLTextAreaElement | null;

        expect(totalInput).not.toBeNull();
        expect(annualCountInput).not.toBeNull();
        expect(reasonInput).not.toBeNull();

        await setInputValue(totalInput!, "2.25");
        await setInputValue(annualCountInput!, "3");
        expect(onEdit).toHaveBeenNthCalledWith(1, 0, { ...request, exceptionTotal: 2.25 });
        expect(onEdit).toHaveBeenNthCalledWith(2, 0, { ...request, exceptionAnnualCount: 3 });
        expect(reasonInput!.value).toBe("Existing justification");
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
                    annualizedTotal: 0.5
                }),
            ]
        });

        expect(host.querySelector("#request-new-indicator-0")).not.toBeNull();
        expect(host.querySelector("#request-1-error")).not.toBeNull();
        expect(host.querySelector("#request-2-otheryear-warning")).not.toBeNull();
        expect(normalizeText(host.textContent)).toContain("0.500");
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
                    exceptionTotal: 1.5,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTotal: 1.5,
                    hasApprovedException: true
                }),
            ]
        });

        const text = normalizeText(host.textContent);

        expect(text).toContain("approved for the above course");
        expect(text).toContain("1.500");
        expect(host.querySelector("#request-0-otheryear-warning")).toBeNull();

        const revokeLink = host.querySelector("#revoke-button") as HTMLAnchorElement | null;
        expect(revokeLink).not.toBeNull();

        await click(revokeLink!);
        expect(normalizeText(document.body.textContent)).toContain("Please confirm");

        await click(getButtonByText("Revoke Approval"));
        expect(onRevoke).toHaveBeenCalledWith(42);
    });
});
