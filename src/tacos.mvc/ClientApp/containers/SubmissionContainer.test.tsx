import * as React from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";

import SubmissionContainer from "./SubmissionContainer";

import type { ICourse } from "../models/ICourse";
import type { IDepartment } from "../models/IDepartment";
import type { IRequest } from "../models/IRequest";

const department: IDepartment = {
    id: 1,
    code: "ECS",
    name: "Engineering Computer Science"
};

const formulaScenarios = [
    {
        courseType: "STD",
        course: { averageEnrollment: 111 },
        expectedPerOffering: "1.000",
        expectedAnnualized: "0.333"
    },
    {
        courseType: "WRT",
        course: { averageEnrollment: 80, averageSectionsPerCourse: 5 },
        expectedPerOffering: "1.000",
        expectedAnnualized: "0.333"
    },
    {
        courseType: "LAB",
        course: { averageEnrollment: 91 },
        expectedPerOffering: "1.500",
        expectedAnnualized: "0.500"
    },
    {
        courseType: "FLD",
        course: { averageEnrollment: 76 },
        expectedPerOffering: "1.500",
        expectedAnnualized: "0.500"
    },
    {
        courseType: "AUTO",
        course: { averageEnrollment: 350 },
        expectedPerOffering: "0.750",
        expectedAnnualized: "0.250"
    },
    {
        courseType: "MAN",
        course: { averageEnrollment: 250 },
        expectedPerOffering: "1.250",
        expectedAnnualized: "0.417"
    },
    {
        courseType: "MODW",
        course: { averageEnrollment: 250 },
        expectedPerOffering: "0.750",
        expectedAnnualized: "0.250"
    },
    {
        courseType: "INT",
        course: { averageEnrollment: 120 },
        expectedPerOffering: "0.750",
        expectedAnnualized: "0.250"
    }
] as const;

interface IRecalculationResult {
    calculatedTaTotal: number;
    calculatedReaderTotal: number;
    annualizedTaTotal: number;
    annualizedReaderTotal: number;
    exceptionAnnualizedTaTotal: number;
    exceptionAnnualizedReaderTotal: number;
}

function createCourse(overrides: Partial<ICourse> = {}): ICourse {
    return {
        averageEnrollment: 0,
        averageSectionsPerCourse: 0,
        crossListingsString: "",
        isCourseTaughtOnceEveryTwoYears: false,
        isCrossListed: false,
        isNew: false,
        isOfferedWithinPastTwoYears: true,
        name: "ECS 001",
        number: "001",
        timesOfferedPerYear: 1,
        wasCourseTaughtInMostRecentYear: true,
        ...overrides
    };
}

function createRequest(
    courseType: string,
    courseOverrides: Partial<ICourse> = {},
    requestOverrides: Partial<IRequest> = {}
): IRequest {
    const course = createCourse(courseOverrides);

    return {
        id: 1,
        course,
        courseName: course.name,
        courseNumber: course.number,
        courseType,
        calculatedTaTotal: 0,
        calculatedReaderTotal: 0,
        annualizedTaTotal: 0,
        annualizedReaderTotal: 0,
        exception: false,
        exceptionReason: "",
        exceptionTaTotal: 0,
        exceptionReaderTotal: 0,
        exceptionAnnualCount: 0,
        exceptionAnnualizedTaTotal: 0,
        exceptionAnnualizedReaderTotal: 0,
        hasApprovedException: false,
        isDirty: true,
        isValid: true,
        ...requestOverrides
    };
}

function normalizeText(value: string | null | undefined): string {
    return (value || "").replace(/\s+/g, " ").trim();
}

describe("SubmissionContainer server recalculation UI coverage", () => {
    let host: HTMLDivElement | undefined;
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

        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    async function renderSubmission(requests: IRequest[]) {
        host = document.createElement("div");
        document.body.appendChild(host);

        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.stubGlobal("scrollTo", vi.fn());
        root = createRoot(host);

        await act(async () => {
            root!.render(<SubmissionContainer department={department} requests={requests} />);
        });
    }

    function stubFetchResults(...results: IRecalculationResult[]) {
        const fetchMock = vi.fn();

        for (const result of results) {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => result,
            });
        }

        vi.stubGlobal("fetch", fetchMock);
        return fetchMock;
    }

    async function advanceRecalculation() {
        await act(async () => {
            vi.advanceTimersByTime(300);
            await Promise.resolve();
        });
    }

    // just a simple wrapper to eliminate a bunch of TS warnings about potential uninitialized variable
    function getHost(): HTMLDivElement {
        if (!host) {
            throw new Error("Test host has not been initialized.");
        }

        return host;
    }

    function getButton(label: string): HTMLButtonElement {
        const button = Array.from(document.body.querySelectorAll("button")).find(
            element => normalizeText(element.textContent) === label
        ) as HTMLButtonElement | undefined;

        expect(button).toBeDefined();
        return button!;
    }

    function getInputByPlaceholder(placeholder: string): HTMLInputElement {
        const input = document.body.querySelector(
            `input[placeholder="${placeholder}"]`
        ) as HTMLInputElement | null;

        expect(input).toBeDefined();
        return input!;
    }

    function setCheckboxValue(checkbox: HTMLInputElement, checked: boolean) {
        if (checkbox.checked === checked) {
            return;
        }

        act(() => {
            checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    function setInputValue(input: HTMLInputElement, value: string) {
        const valueSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        )?.set;

        expect(valueSetter).toBeDefined();

        act(() => {
            valueSetter!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        });
    }

    it.each(formulaScenarios)(
        "renders $courseType request totals from server-hydrated values",
        async ({ courseType, course, expectedPerOffering, expectedAnnualized }) => {
            await renderSubmission([
                createRequest(courseType, course, {
                    calculatedTaTotal: Number(expectedPerOffering),
                    annualizedTaTotal: Number(expectedAnnualized),
                })
            ]);

            const text = normalizeText(getHost().textContent);

            expect(text).toContain(expectedPerOffering);
            expect(text).toContain(`TA Total: ${expectedAnnualized} | Reader Total: ---`);
        }
    );

    it("updates the rendered totals when the user changes the course type", async () => {
        vi.useFakeTimers();
        const fetchMock = stubFetchResults({
            calculatedTaTotal: 1.25,
            calculatedReaderTotal: 0,
            annualizedTaTotal: 0.417,
            annualizedReaderTotal: 0,
            exceptionAnnualizedTaTotal: 0,
            exceptionAnnualizedReaderTotal: 0,
        });

        await renderSubmission([
            createRequest("STD", {
                averageEnrollment: 250,
                name: "ECS 250",
                number: "250"
            }, {
                calculatedTaTotal: 1.5,
                annualizedTaTotal: 0.833,
            })
        ]);

        const currentHost = getHost();

        expect(normalizeText(currentHost.textContent)).toContain("TA Total: 0.833 | Reader Total: ---");

        const courseTypeSelect = Array.from(currentHost.querySelectorAll("select")).find(
            element => (element as HTMLSelectElement).value === "STD"
        ) as HTMLSelectElement | undefined;

        expect(courseTypeSelect).toBeDefined();

        act(() => {
            courseTypeSelect!.value = "MAN";
            courseTypeSelect!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        await advanceRecalculation();

        const updatedText = normalizeText(getHost().textContent);

        expect(updatedText).toContain("1.250");
        expect(updatedText).toContain("TA Total: 0.417 | Reader Total: ---");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("preserves the in-progress course number input across the debounced parent update", async () => {
        vi.useFakeTimers();

        try {
            await renderSubmission([
                createRequest("STD", {
                    name: "ECS 120",
                    number: "120"
                })
            ]);

            const courseInput = getHost().querySelector(
                "tbody tr[data-request-row='true'] input[data-course-number-input='true']"
            ) as HTMLInputElement | null;
            const valueSetter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
            )?.set;

            expect(courseInput).toBeDefined();
            expect(valueSetter).toBeDefined();

            act(() => {
                courseInput!.focus();
                valueSetter!.call(courseInput, "TAC 1");
                courseInput!.dispatchEvent(new Event("input", { bubbles: true }));
                courseInput!.dispatchEvent(new Event("change", { bubbles: true }));
            });

            expect(courseInput!.value).toBe("TAC 1");
            expect(document.activeElement).toBe(courseInput);

            act(() => {
                vi.advanceTimersByTime(110);
            });

            const updatedInput = getHost().querySelector(
                "tbody tr[data-request-row='true'] input[data-course-number-input='true']"
            ) as HTMLInputElement | null;

            expect(updatedInput).toBeDefined();
            expect(updatedInput).toBe(courseInput);
            expect(updatedInput!.value).toBe("TAC 1");
            expect(document.activeElement).toBe(updatedInput);
        }
        finally {
            vi.useRealTimers();
        }
    });

    it("inserts a newly created empty request at the bottom of the table", async () => {
        await renderSubmission([
            createRequest("STD", {
                name: "ECS 120",
                number: "120"
            }, {
                id: 101,
            }),
            createRequest("MAN", {
                name: "ECS 140A",
                number: "140A"
            }, {
                id: 202,
            }),
        ]);

        const createRequestButton = Array.from(document.body.querySelectorAll("button")).find(
            element => normalizeText(element.textContent) === "Create New Request"
        ) as HTMLButtonElement | undefined;

        expect(createRequestButton).toBeDefined();

        act(() => {
            createRequestButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        const requestRows = Array.from(
            getHost().querySelectorAll("tbody tr[data-request-row='true']")
        ) as HTMLTableRowElement[];

        expect(requestRows).toHaveLength(3);

        const firstRowText = normalizeText(requestRows[0].textContent);
        const secondRowText = normalizeText(requestRows[1].textContent);
        const thirdRowInput = requestRows[2].querySelector(
            "input[data-course-number-input='true']"
        ) as HTMLInputElement | null;

        expect(firstRowText).toContain("120");
        expect(secondRowText).toContain("140A");
        expect(thirdRowInput).not.toBeNull();
        expect(thirdRowInput!.value).toBe("");
    });

    it("uses exception values in the rendered annualized totals once they are entered", async () => {
        vi.useFakeTimers();
        stubFetchResults(
            {
                calculatedTaTotal: 1,
                calculatedReaderTotal: 0,
                annualizedTaTotal: 0.333,
                annualizedReaderTotal: 0,
                exceptionAnnualizedTaTotal: 0,
                exceptionAnnualizedReaderTotal: 0,
            },
            {
                calculatedTaTotal: 1,
                calculatedReaderTotal: 0,
                annualizedTaTotal: 0.333,
                annualizedReaderTotal: 0,
                exceptionAnnualizedTaTotal: 0,
                exceptionAnnualizedReaderTotal: 0,
            },
            {
                calculatedTaTotal: 1,
                calculatedReaderTotal: 0,
                annualizedTaTotal: 0.333,
                annualizedReaderTotal: 0,
                exceptionAnnualizedTaTotal: 1.5,
                exceptionAnnualizedReaderTotal: 0,
            }
        );

        await renderSubmission([
            createRequest("STD", {
                averageEnrollment: 111,
                name: "ECS 111",
                number: "111"
            }, {
                calculatedTaTotal: 1,
                annualizedTaTotal: 0.333,
            })
        ]);

        const currentHost = getHost();

        expect(normalizeText(currentHost.textContent)).toContain("TA Total: 0.333 | Reader Total: ---");

        const exceptionCheckbox = currentHost.querySelector(
            "input[type=\"checkbox\"]"
        ) as HTMLInputElement | null;

        expect(exceptionCheckbox).toBeDefined();

        await setCheckboxValue(exceptionCheckbox!, true);
        await advanceRecalculation();

        expect(normalizeText(getHost().textContent)).toContain("Proposed TA % per course offering");
        expect(normalizeText(getHost().textContent)).toContain("Proposed Reader % per course offering");
        expect(getButton("Save Changes").disabled).toBe(true);
        expect(getButton("Submit for Approval").disabled).toBe(true);

        await setInputValue(getInputByPlaceholder("TA FTE requested"), "1.50");
        await advanceRecalculation();
        await setInputValue(getInputByPlaceholder("Annual offerings requested"), "3");
        await advanceRecalculation();

        const updatedText = normalizeText(getHost().textContent);

        expect(updatedText).toContain("TA Total: 1.500 | Reader Total: ---");
        expect(updatedText).toContain("1.500");
        expect(getButton("Save Changes").disabled).toBe(false);
        expect(getButton("Submit for Approval").disabled).toBe(false);
    });

    it("restores server-calculated totals when an exception is removed", async () => {
        vi.useFakeTimers();
        stubFetchResults({
            calculatedTaTotal: 1,
            calculatedReaderTotal: 0,
            annualizedTaTotal: 0.333,
            annualizedReaderTotal: 0,
            exceptionAnnualizedTaTotal: 0,
            exceptionAnnualizedReaderTotal: 0,
        });

        await renderSubmission([
            createRequest(
                "STD",
                {
                    averageEnrollment: 111,
                    name: "ECS 111",
                    number: "111"
                },
                {
                    exception: true,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualCount: 3,
                    calculatedTaTotal: 1,
                    annualizedTaTotal: 0.333,
                    exceptionAnnualizedTaTotal: 1.5,
                }
            )
        ]);

        const currentHost = getHost();

        expect(normalizeText(currentHost.textContent)).toContain("TA Total: 1.500 | Reader Total: ---");

        const exceptionCheckbox = currentHost.querySelector(
            "input[type=\"checkbox\"]"
        ) as HTMLInputElement | null;

        expect(exceptionCheckbox).toBeDefined();

        await setCheckboxValue(exceptionCheckbox!, false);
        await advanceRecalculation();

        const updatedText = normalizeText(getHost().textContent);

        expect(updatedText).not.toContain("Proposed TA % per course offering");
        expect(updatedText).toContain("TA Total: 0.333 | Reader Total: ---");
    });

    it("renders the approved exception state using the exception totals", async () => {
        await renderSubmission([
            createRequest(
                "MAN",
                {
                    averageEnrollment: 250,
                    name: "ECS 250",
                    number: "250"
                },
                {
                    id: 42,
                    exception: true,
                    exceptionTaTotal: 1.5,
                    exceptionAnnualCount: 3,
                    exceptionAnnualizedTaTotal: 1.5,
                    hasApprovedException: true
                }
            )
        ]);

        const currentHost = getHost();
        const text = normalizeText(currentHost.textContent);

        expect(text).toContain("approved for the above course");
        expect(text).toContain("TA Total: 1.500 | Reader Total: ---");
        expect(currentHost.querySelector("#revoke-button")).not.toBeNull();
    });

    it("shows a non-blocking warning when recalculation fails", async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn().mockRejectedValueOnce(new Error("boom"));
        vi.stubGlobal("fetch", fetchMock);

        await renderSubmission([
            createRequest("STD", {
                averageEnrollment: 250,
                name: "ECS 250",
                number: "250"
            }, {
                calculatedTaTotal: 1.5,
                annualizedTaTotal: 0.833,
            })
        ]);

        const currentHost = getHost();
        const courseTypeSelect = Array.from(currentHost.querySelectorAll("select")).find(
            element => (element as HTMLSelectElement).value === "STD"
        ) as HTMLSelectElement | undefined;

        expect(courseTypeSelect).toBeDefined();

        act(() => {
            courseTypeSelect!.value = "MAN";
            courseTypeSelect!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        await advanceRecalculation();

        const warningButton = getHost().querySelector(
            "button[aria-label='Request calculation warning']"
        );

        expect(warningButton).not.toBeNull();
        expect(getButton("Save Changes").disabled).toBe(false);
        expect(getButton("Submit for Approval").disabled).toBe(false);
    });
});
