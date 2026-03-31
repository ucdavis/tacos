import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SubmissionContainer from "./SubmissionContainer";
import type { ICourse } from "../models/ICourse";
import type { IDepartment } from "../models/IDepartment";
import type { IRequest } from "../models/IRequest";

vi.mock("../components/CreateCourseModal", () => ({
    default: () => null
}));

vi.mock("../components/RequestsTable", () => ({
    default: ({ requests, onEdit }: any) => (
        <div data-testid="requests-table">
            {requests.map((request: IRequest, index: number) => {
                const displayedAnnualized = request.exception
                    ? request.exceptionAnnualizedTotal
                    : request.annualizedTotal;

                return (
                    <section data-testid={`request-${index}`} key={request.courseNumber || index}>
                        <div>{`Calculated: ${request.calculatedTotal.toFixed(3)}`}</div>
                        <div>{`Annualized: ${displayedAnnualized.toFixed(3)}`}</div>
                        <button
                            type="button"
                            onClick={() => onEdit(index, { ...request, courseType: "INT" })}
                        >
                            Switch to intensive
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                onEdit(index, {
                                    ...request,
                                    exception: true,
                                    exceptionTotal: 1.25,
                                    exceptionAnnualCount: 2
                                })
                            }
                        >
                            Request exception
                        </button>
                    </section>
                );
            })}
        </div>
    )
}));

afterEach(() => {
    cleanup();
});

describe("SubmissionContainer", () => {
    it("shows recalculated totals and updates the request total when request settings change", () => {
        render(
            <SubmissionContainer
                department={createDepartment()}
                requests={[
                    createRequest({
                        course: createCourse({
                            averageEnrollment: 55,
                            timesOfferedPerYear: 2
                        }),
                        calculatedTotal: 99,
                        annualizedTotal: 99
                    })
                ]}
            />
        );

        const request = screen.getByTestId("request-0");
        expect(within(request).getByText("Calculated: 0.500")).toBeInTheDocument();
        expect(within(request).getByText("Annualized: 0.333")).toBeInTheDocument();
        expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.333");

        fireEvent.click(screen.getByRole("button", { name: "Switch to intensive" }));

        expect(within(request).getByText("Calculated: 0.250")).toBeInTheDocument();
        expect(within(request).getByText("Annualized: 0.167")).toBeInTheDocument();
        expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.167");

        fireEvent.click(screen.getByRole("button", { name: "Request exception" }));

        expect(within(request).getByText("Calculated: 0.250")).toBeInTheDocument();
        expect(within(request).getByText("Annualized: 0.833")).toBeInTheDocument();
        expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.833");
    });

    it("shows no annualized total in the summary for off-year every-other-year courses", () => {
        render(
            <SubmissionContainer
                department={createDepartment()}
                requests={[
                    createRequest({
                        courseType: "FLD",
                        course: createCourse({
                            averageEnrollment: 25,
                            timesOfferedPerYear: 1,
                            isCourseTaughtOnceEveryTwoYears: true,
                            wasCourseTaughtInMostRecentYear: true
                        })
                    })
                ]}
            />
        );

        const request = screen.getByTestId("request-0");
        expect(within(request).getByText("Calculated: 0.500")).toBeInTheDocument();
        expect(within(request).getByText("Annualized: 0.000")).toBeInTheDocument();
        expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: ---");
    });
});

function createDepartment(): IDepartment {
    return {
        id: 1,
        code: "ECS",
        name: "Engineering Computer Science"
    };
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
        number: "ECS001",
        timesOfferedPerYear: 1,
        wasCourseTaughtInMostRecentYear: false,
        ...overrides
    };
}

function createRequest(overrides: Partial<IRequest> = {}): IRequest {
    return {
        course: createCourse(),
        courseName: "ECS 001",
        courseNumber: "ECS001",
        courseType: "STD",
        requestType: "TA",
        calculatedTotal: 0,
        annualizedTotal: 0,
        exception: false,
        exceptionReason: "",
        exceptionTotal: 0,
        exceptionAnnualCount: 0,
        exceptionAnnualizedTotal: 0,
        hasApprovedException: false,
        isValid: true,
        ...overrides
    };
}
