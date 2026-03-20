import { describe, expect, it } from "vitest";

import type { ICourse } from "../models/ICourse";
import { annualizationRatio, formulas } from "./formulas";

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

describe("formulas", () => {
    it("returns no standard lecture support below the minimum enrollment", () => {
        expect(formulas.STD.calculate(createCourse({ averageEnrollment: 54 }))).toBe(0);
    });

    it("rounds standard lecture support to half-time increments", () => {
        expect(formulas.STD.calculate(createCourse({ averageEnrollment: 55 }))).toBe(0.5);
        expect(formulas.STD.calculate(createCourse({ averageEnrollment: 111 }))).toBe(1);
    });

    it("normalizes odd writing sections before calculating support", () => {
        expect(
            formulas.WRT.calculate(
                createCourse({
                    averageEnrollment: 80,
                    averageSectionsPerCourse: 5
                })
            )
        ).toBe(1);
    });

    it("applies manual grading support in quarter-time increments", () => {
        expect(formulas.MAN.calculate(createCourse({ averageEnrollment: 250 }))).toBe(1.25);
    });

    it("exports the annualization ratio used by request totals", () => {
        expect(annualizationRatio).toBeCloseTo(1 / 3);
    });
});
