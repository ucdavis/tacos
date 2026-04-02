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
        requestType: "TA",
        calculatedTotal: 0,
        annualizedTotal: 0,
        exception: false,
        exceptionReason: "",
        exceptionTotal: 0,
        exceptionAnnualCount: 0,
        exceptionAnnualizedTotal: 0,
        hasApprovedException: false,
        isDirty: true,
        isValid: true,
        ...requestOverrides
    };
}

function normalizeText(value: string | null | undefined): string {
    return (value || "").replace(/\s+/g, " ").trim();
}

describe("SubmissionContainer formula UI coverage", () => {
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

        vi.unstubAllGlobals();
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

    async function setCheckboxValue(checkbox: HTMLInputElement, checked: boolean) {
        if (checkbox.checked === checked) {
            return;
        }

        await act(async () => {
            checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    async function setInputValue(input: HTMLInputElement, value: string) {
        const valueSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        )?.set;

        expect(valueSetter).toBeDefined();

        await act(async () => {
            valueSetter!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        });
    }

    it.each(formulaScenarios)(
        "renders $courseType request totals from the configured formula",
        async ({ courseType, course, expectedPerOffering, expectedAnnualized }) => {
            await renderSubmission([createRequest(courseType, course)]);

            const text = normalizeText(host.textContent);

            expect(text).toContain(expectedPerOffering);
            expect(text).toContain(`Request Total: ${expectedAnnualized}`);
        }
    );

    it("updates the rendered totals when the user changes the course type", async () => {
        await renderSubmission([
            createRequest("STD", {
                averageEnrollment: 250,
                name: "ECS 250",
                number: "250"
            })
        ]);

        expect(normalizeText(host.textContent)).toContain("Request Total: 0.833");

        const courseTypeSelect = Array.from(host.querySelectorAll("select")).find(
            element => (element as HTMLSelectElement).value === "STD"
        ) as HTMLSelectElement | undefined;

        expect(courseTypeSelect).toBeDefined();

        await act(async () => {
            courseTypeSelect!.value = "MAN";
            courseTypeSelect!.dispatchEvent(new Event("change", { bubbles: true }));
        });

        const updatedText = normalizeText(host.textContent);

        expect(updatedText).toContain("1.250");
        expect(updatedText).toContain("Request Total: 0.417");
    });

    it("uses exception values in the rendered annualized totals once they are entered", async () => {
        await renderSubmission([
            createRequest("STD", {
                averageEnrollment: 111,
                name: "ECS 111",
                number: "111"
            })
        ]);

        expect(normalizeText(host.textContent)).toContain("Request Total: 0.333");

        const exceptionCheckbox = host.querySelector(
            "input[type=\"checkbox\"]"
        ) as HTMLInputElement | null;

        expect(exceptionCheckbox).toBeDefined();

        await setCheckboxValue(exceptionCheckbox!, true);

        expect(normalizeText(host.textContent)).toContain("Proposed TA % per course offering");
        expect(getButton("Save Changes").disabled).toBe(true);
        expect(getButton("Submit for Approval").disabled).toBe(true);

        await setInputValue(getInputByPlaceholder("Total FTE requested"), "1.50");
        await setInputValue(getInputByPlaceholder("Annual offerings requested"), "3");

        const updatedText = normalizeText(host.textContent);

        expect(updatedText).toContain("Request Total: 1.500");
        expect(updatedText).toContain("1.500");
        expect(getButton("Save Changes").disabled).toBe(false);
        expect(getButton("Submit for Approval").disabled).toBe(false);
    });

    it("restores formula-based totals when an exception is removed", async () => {
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
                    exceptionTotal: 1.5,
                    exceptionAnnualCount: 3
                }
            )
        ]);

        expect(normalizeText(host.textContent)).toContain("Request Total: 1.500");

        const exceptionCheckbox = host.querySelector(
            "input[type=\"checkbox\"]"
        ) as HTMLInputElement | null;

        expect(exceptionCheckbox).toBeDefined();

        await setCheckboxValue(exceptionCheckbox!, false);

        const updatedText = normalizeText(host.textContent);

        expect(updatedText).not.toContain("Proposed TA % per course offering");
        expect(updatedText).toContain("Request Total: 0.333");
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
                    exceptionTotal: 1.5,
                    exceptionAnnualCount: 3,
                    hasApprovedException: true
                }
            )
        ]);

        const text = normalizeText(host.textContent);

        expect(text).toContain("approved for the above course");
        expect(text).toContain("Request Total: 1.500");
        expect(host.querySelector("#revoke-button")).not.toBeNull();
    });
});
