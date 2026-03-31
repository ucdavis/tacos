import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SubmissionContainer from "./SubmissionContainer";
import type { ICourse } from "../models/ICourse";
import type { IDepartment } from "../models/IDepartment";
import type { IRequest } from "../models/IRequest";

vi.mock("../components/CreateCourseModal", () => ({
    default: () => null
}));

vi.mock("../components/RequestsTable", () => ({
    default: ({ requests, onEdit, onRemove }: any) => (
        <div data-testid="requests-table">
            {requests.map((request: IRequest, index: number) => {
                const displayedAnnualized = request.exception
                    ? request.exceptionAnnualizedTotal
                    : request.annualizedTotal;

                return (
                    <section data-testid={`request-${index}`} key={request.stableId || request.courseNumber || index}>
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
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                        >
                            Remove request
                        </button>
                    </section>
                );
            })}
        </div>
    )
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe("SubmissionContainer", () => {
    it("uses backend calculations to update request totals when request settings change", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(createFetchResponse({
                calculatedTotal: 0.25,
                annualizedTotal: 0.167,
                exceptionAnnualizedTotal: 0
            }))
            .mockResolvedValueOnce(createFetchResponse({
                calculatedTotal: 0.25,
                annualizedTotal: 0.167,
                exceptionAnnualizedTotal: 0.833
            }));

        vi.stubGlobal("fetch", fetchMock);

        render(
            <SubmissionContainer
                department={createDepartment()}
                requests={[
                    createRequest({
                        course: createCourse({
                            averageEnrollment: 55,
                            timesOfferedPerYear: 2
                        }),
                        calculatedTotal: 0.5,
                        annualizedTotal: 0.333
                    })
                ]}
            />
        );

        const request = screen.getByTestId("request-0");
        expect(within(request).getByText("Calculated: 0.500")).toBeInTheDocument();
        expect(within(request).getByText("Annualized: 0.333")).toBeInTheDocument();
        expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.333");

        fireEvent.click(screen.getByRole("button", { name: "Switch to intensive" }));

        await waitFor(() => {
            expect(within(request).getByText("Calculated: 0.250")).toBeInTheDocument();
            expect(within(request).getByText("Annualized: 0.167")).toBeInTheDocument();
            expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.167");
        });

        fireEvent.click(screen.getByRole("button", { name: "Request exception" }));

        await waitFor(() => {
            expect(within(request).getByText("Calculated: 0.250")).toBeInTheDocument();
            expect(within(request).getByText("Annualized: 0.833")).toBeInTheDocument();
            expect(screen.getByText(/Request Total:/)).toHaveTextContent("Request Total: 0.833");
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "/requests/calculate",
            expect.objectContaining({ method: "POST" })
        );

        const firstPayload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(firstPayload.courseType).toBe("INT");
        expect(firstPayload.exception).toBe(false);

        const secondPayload = JSON.parse(fetchMock.mock.calls[1][1].body as string);
        expect(secondPayload.courseType).toBe("INT");
        expect(secondPayload.exception).toBe(true);
        expect(secondPayload.exceptionTotal).toBe(1.25);
        expect(secondPayload.exceptionAnnualCount).toBe(2);
    });

    it("shows no annualized total in the summary for off-year every-other-year courses", () => {
        render(
            <SubmissionContainer
                department={createDepartment()}
                requests={[
                    createRequest({
                        courseType: "FLD",
                        calculatedTotal: 0.5,
                        annualizedTotal: 0,
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

    it("ignores late calculation responses for removed unsaved requests", async () => {
        const pendingResponse = createDeferredFetchResponse();
        const fetchMock = vi.fn().mockReturnValue(pendingResponse.promise);

        vi.stubGlobal("fetch", fetchMock);

        render(
            <SubmissionContainer
                department={createDepartment()}
                requests={[
                    createRequest({
                        stableId: "client-pending",
                        courseNumber: "ECS001",
                        courseName: "ECS 001",
                        calculatedTotal: 0.5,
                        annualizedTotal: 0.333
                    }),
                    createRequest({
                        stableId: "client-remaining",
                        course: createCourse({
                            name: "ECS 002",
                            number: "ECS002",
                            averageEnrollment: 80
                        }),
                        courseName: "ECS 002",
                        courseNumber: "ECS002",
                        calculatedTotal: 0.75,
                        annualizedTotal: 0.5
                    })
                ]}
            />
        );

        fireEvent.click(within(screen.getByTestId("request-0")).getByRole("button", { name: "Switch to intensive" }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(within(screen.getByTestId("request-0")).getByRole("button", { name: "Remove request" }));

        await waitFor(() => {
            expect(within(screen.getByTestId("request-0")).getByText("Calculated: 0.750")).toBeInTheDocument();
            expect(within(screen.getByTestId("request-0")).getByText("Annualized: 0.500")).toBeInTheDocument();
        });

        pendingResponse.resolve(createFetchResponse({
            calculatedTotal: 0.25,
            annualizedTotal: 0.167,
            exceptionAnnualizedTotal: 0
        }));

        await waitFor(() => {
            expect(within(screen.getByTestId("request-0")).getByText("Calculated: 0.750")).toBeInTheDocument();
            expect(within(screen.getByTestId("request-0")).getByText("Annualized: 0.500")).toBeInTheDocument();
        });
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

function createFetchResponse(body: object) {
    return {
        ok: true,
        json: async () => body
    };
}

function createDeferredFetchResponse() {
    let resolve!: (value: { ok: true; json: () => Promise<object> }) => void;
    const promise = new Promise<{ ok: true; json: () => Promise<object> }>((res) => {
        resolve = res;
    });

    return {
        promise,
        resolve
    };
}
