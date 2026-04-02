import * as React from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";

vi.mock("reactstrap", async importOriginal => {
    const actual = await importOriginal<typeof import("reactstrap")>();

    return {
        ...actual,
        Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen?: boolean }) =>
            isOpen ? <div data-testid="mock-modal">{children}</div> : null,
        ModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        ModalBody: ({
            children,
            className
        }: {
            children: React.ReactNode;
            className?: string;
        }) => <div className={className}>{children}</div>,
        ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Button: ({
            children,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>
    };
});

import RequestsTable from "./RequestsTable";

import type { ICourse } from "../models/ICourse";
import type { IRequest } from "../models/IRequest";

function createCourse(overrides: Partial<ICourse> = {}): ICourse {
    return {
        averageEnrollment: 110,
        averageSectionsPerCourse: 2,
        crossListingsString: "",
        isCourseTaughtOnceEveryTwoYears: false,
        isCrossListed: false,
        isNew: false,
        isOfferedWithinPastTwoYears: true,
        name: "ECS 101 Intro to Testing",
        number: "ECS 101",
        timesOfferedPerYear: 1,
        wasCourseTaughtInMostRecentYear: true,
        ...overrides
    };
}

function createRequest(overrides: Partial<IRequest> = {}): IRequest {
    const course = overrides.course === undefined
        ? createCourse()
        : overrides.course;

    return {
        id: 1,
        course,
        courseName: course?.name || "",
        courseNumber: course?.number || "",
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

function normalizeHtml(element: Element | null): string {
    return (element?.innerHTML || "").replace(/\s+/g, " ").trim();
}

describe("RequestsTable UI coverage", () => {
    let host: HTMLDivElement;
    let root: Root | undefined;

    afterEach(async () => {
        if (root) {
            await act(async () => {
                root!.unmount();
            });
            root = undefined;
        }

        if (host) {
            host.remove();
        }

        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    async function renderRequestsTable(
        props: Partial<React.ComponentProps<typeof RequestsTable>> = {}
    ) {
        const defaultProps: React.ComponentProps<typeof RequestsTable> = {
            className: "table-under-test",
            requests: [createRequest()],
            onEdit: vi.fn(),
            onRemove: vi.fn(),
            onRevoke: vi.fn(),
            onCourseCreate: vi.fn()
        };

        const renderedProps = {
            ...defaultProps,
            ...props
        };

        host = document.createElement("div");
        document.body.appendChild(host);

        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        root = createRoot(host);

        await act(async () => {
            root!.render(<RequestsTable {...renderedProps} />);
        });

        const rerender = async (
            nextProps: Partial<React.ComponentProps<typeof RequestsTable>> = {}
        ) => {
            const updatedProps = {
                ...renderedProps,
                ...nextProps
            };

            await act(async () => {
                root!.render(<RequestsTable {...updatedProps} />);
            });

            return updatedProps;
        };

        return {
            host,
            props: renderedProps,
            rerender
        };
    }

    function getTableHost() {
        const table = host.querySelector(".ReactTable");
        expect(table).not.toBeNull();
        return table!;
    }

    function getVisibleCourseNames() {
        return Array.from(host.querySelectorAll(".rt-tr-group small .text-truncate"))
            .map(element => element.textContent?.trim() || "")
            .filter(Boolean);
    }

    it("renders the current table layout and visible states", async () => {
        await renderRequestsTable({
            requests: [
                createRequest({
                    id: 7,
                    course: createCourse({
                        name: "ECS 120 Software Engineering",
                        number: "ECS 120",
                        isNew: true
                    }),
                    courseName: "ECS 120 Software Engineering",
                    courseNumber: "ECS 120",
                    isFocused: true
                }),
                createRequest({
                    id: 8,
                    course: createCourse({
                        name: "ECS 132 Probability",
                        number: "ECS 132",
                        isCourseTaughtOnceEveryTwoYears: true,
                        wasCourseTaughtInMostRecentYear: true
                    }),
                    courseName: "ECS 132 Probability",
                    courseNumber: "ECS 132",
                    annualizedTotal: 0,
                    error: "Duplicate course in request above",
                    isValid: false
                }),
                createRequest({
                    id: 9,
                    course: createCourse({
                        name: "ECS 140A Programming Languages",
                        number: "ECS 140A"
                    }),
                    courseName: "ECS 140A Programming Languages",
                    courseNumber: "ECS 140A",
                    exception: true,
                    exceptionTotal: 1.5,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTotal: 1.5,
                    hasApprovedException: true
                })
            ]
        });

        expect(normalizeHtml(getTableHost())).toMatchSnapshot();
        expect(host.querySelector("#request-7")?.className).toContain("target-flash");
        expect(host.querySelector("#request-new-indicator-0")).not.toBeNull();
        expect(host.querySelector("#request-1-otheryear-warning")).not.toBeNull();
        expect(host.querySelector("#request-1-error")).not.toBeNull();
        expect(host.textContent).toContain("approved for the above course");
    });

    it("filters rows from the course number prop and updates when the prop changes", async () => {
        const requests = [
            createRequest({
                id: 10,
                course: createCourse({ name: "ECS 120 Software Engineering", number: "ECS 120" }),
                courseName: "ECS 120 Software Engineering",
                courseNumber: "ECS 120"
            }),
            createRequest({
                id: 11,
                course: createCourse({ name: "ECS 140A Programming Languages", number: "ECS 140A" }),
                courseName: "ECS 140A Programming Languages",
                courseNumber: "ECS 140A"
            })
        ];

        const view = await renderRequestsTable({
            requests,
            courseNumberFilter: "140A"
        });

        expect(getVisibleCourseNames()).toEqual(["ECS 140A Programming Languages"]);

        await view.rerender({
            requests,
            courseNumberFilter: "120"
        });

        expect(getVisibleCourseNames()).toEqual(["ECS 120 Software Engineering"]);

        await view.rerender({
            requests,
            courseNumberFilter: undefined
        });

        expect(getVisibleCourseNames()).toEqual([
            "ECS 120 Software Engineering",
            "ECS 140A Programming Languages"
        ]);
    });

    it("keeps deleted requests out of the rendered table", async () => {
        await renderRequestsTable({
            requests: [
                createRequest({
                    id: 12,
                    course: createCourse({ name: "ECS 150 Operating Systems", number: "ECS 150" }),
                    courseName: "ECS 150 Operating Systems",
                    courseNumber: "ECS 150"
                }),
                createRequest({
                    id: 13,
                    course: createCourse({ name: "ECS 154B Computer Architecture", number: "ECS 154B" }),
                    courseName: "ECS 154B Computer Architecture",
                    courseNumber: "ECS 154B",
                    isDeleted: true
                })
            ]
        });

        expect(getVisibleCourseNames()).toEqual(["ECS 150 Operating Systems"]);
        expect(host.textContent).not.toContain("ECS 154B Computer Architecture");
    });

    it("calls onEdit when table controls change", async () => {
        const onEdit = vi.fn();

        await renderRequestsTable({
            onEdit,
            requests: [
                createRequest({
                    id: 14,
                    course: createCourse({ name: "ECS 160", number: "ECS 160" }),
                    courseName: "ECS 160",
                    courseNumber: "ECS 160"
                })
            ]
        });

        const selects = Array.from(host.querySelectorAll("select")) as HTMLSelectElement[];
        expect(selects.length).toBeGreaterThanOrEqual(5);

        const courseTypeSelect = selects.find(element => element.value === "STD");
        const requestTypeSelect = selects.find(element => element.value === "TA");
        const exceptionCheckbox = host.querySelector("input[type=\"checkbox\"]") as HTMLInputElement | null;

        expect(courseTypeSelect).toBeDefined();
        expect(requestTypeSelect).toBeDefined();
        expect(exceptionCheckbox).not.toBeNull();

        await act(async () => {
            courseTypeSelect!.value = "MAN";
            courseTypeSelect!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        expect(onEdit).toHaveBeenLastCalledWith(
            0,
            expect.objectContaining({
                courseType: "MAN"
            })
        );

        await act(async () => {
            requestTypeSelect!.value = "READ";
            requestTypeSelect!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        expect(onEdit).toHaveBeenLastCalledWith(
            0,
            expect.objectContaining({
                requestType: "READ"
            })
        );

        await act(async () => {
            exceptionCheckbox!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        expect(onEdit).toHaveBeenLastCalledWith(
            0,
            expect.objectContaining({
                exception: true
            })
        );
    });

    it("calls onRemove and onRevoke from the row actions", async () => {
        const onRemove = vi.fn();
        const onRevoke = vi.fn();

        await renderRequestsTable({
            onRemove,
            onRevoke,
            requests: [
                createRequest({
                    id: 15,
                    course: createCourse({ name: "ECS 170 AI", number: "ECS 170" }),
                    courseName: "ECS 170 AI",
                    courseNumber: "ECS 170",
                    exception: true,
                    exceptionTotal: 1.25,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTotal: 1.25,
                    hasApprovedException: true
                })
            ]
        });

        const removeButton = host.querySelector(".btn-danger") as HTMLButtonElement | null;
        const revokeLink = host.querySelector("#revoke-button") as HTMLAnchorElement | null;

        expect(removeButton).not.toBeNull();
        expect(revokeLink).not.toBeNull();

        await act(async () => {
            removeButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        expect(onRemove).toHaveBeenCalledWith(0);

        await act(async () => {
            revokeLink!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        const confirmButton = Array.from(host.querySelectorAll("button")).find(
            element => element.textContent?.trim() === "Revoke Approval"
        ) as HTMLButtonElement | undefined;

        expect(confirmButton).toBeDefined();

        await act(async () => {
            confirmButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        expect(onRevoke).toHaveBeenCalledWith(15);
    });
});
