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
        expect(formulas.STD.calculate(createCourse({ averageEnrollment: 165 }))).toBe(1.5);
    });

    it("requires at least two normalized writing sections", () => {
        expect(
            formulas.WRT.calculate(
                createCourse({
                    averageEnrollment: 80,
                    averageSectionsPerCourse: 1
                })
            )
        ).toBe(0);
    });

    it("requires writing sections to average at least twenty students", () => {
        expect(
            formulas.WRT.calculate(
                createCourse({
                    averageEnrollment: 39,
                    averageSectionsPerCourse: 2
                })
            )
        ).toBe(0);
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

    it("returns no lab support below the minimum enrollment", () => {
        expect(formulas.LAB.calculate(createCourse({ averageEnrollment: 24 }))).toBe(0);
    });

    it("rounds lab support to half-time increments", () => {
        expect(formulas.LAB.calculate(createCourse({ averageEnrollment: 25 }))).toBe(0.5);
        expect(formulas.LAB.calculate(createCourse({ averageEnrollment: 91 }))).toBe(1.5);
    });

    it("calculates field class support in half-time increments without a minimum threshold", () => {
        expect(formulas.FLD.calculate(createCourse({ averageEnrollment: 0 }))).toBe(0);
        expect(formulas.FLD.calculate(createCourse({ averageEnrollment: 24 }))).toBe(0.5);
        expect(formulas.FLD.calculate(createCourse({ averageEnrollment: 76 }))).toBe(1.5);
    });

    it("returns no automated grading support below the minimum enrollment", () => {
        expect(formulas.AUTO.calculate(createCourse({ averageEnrollment: 149 }))).toBe(0);
    });

    it("applies automated grading support in quarter-time increments", () => {
        expect(formulas.AUTO.calculate(createCourse({ averageEnrollment: 150 }))).toBe(0.25);
        expect(formulas.AUTO.calculate(createCourse({ averageEnrollment: 250 }))).toBe(0.5);
        expect(formulas.AUTO.calculate(createCourse({ averageEnrollment: 350 }))).toBe(0.75);
    });

    it("returns no manual grading support below the minimum enrollment", () => {
        expect(formulas.MAN.calculate(createCourse({ averageEnrollment: 149 }))).toBe(0);
    });

    it("applies manual grading support in quarter-time increments", () => {
        expect(formulas.MAN.calculate(createCourse({ averageEnrollment: 150 }))).toBe(0.75);
        expect(formulas.MAN.calculate(createCourse({ averageEnrollment: 250 }))).toBe(1.25);
    });

    it("returns no moderate writing support below the minimum enrollment", () => {
        expect(formulas.MODW.calculate(createCourse({ averageEnrollment: 99 }))).toBe(0);
    });

    it("applies moderate writing support in quarter-time increments", () => {
        expect(formulas.MODW.calculate(createCourse({ averageEnrollment: 100 }))).toBe(0.25);
        expect(formulas.MODW.calculate(createCourse({ averageEnrollment: 250 }))).toBe(0.75);
    });

    it("returns no intensive writing support below the minimum enrollment", () => {
        expect(formulas.INT.calculate(createCourse({ averageEnrollment: 39 }))).toBe(0);
    });

    it("applies intensive writing support in quarter-time increments", () => {
        expect(formulas.INT.calculate(createCourse({ averageEnrollment: 40 }))).toBe(0.25);
        expect(formulas.INT.calculate(createCourse({ averageEnrollment: 120 }))).toBe(0.75);
    });

    it("exports the annualization ratio used by request totals", () => {
        expect(annualizationRatio).toBeCloseTo(1 / 3);
    });
});
