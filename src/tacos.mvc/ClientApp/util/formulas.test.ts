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
    it.each([
        ["STD", createCourse({ averageEnrollment: 54 }), 0],
        ["STD", createCourse({ averageEnrollment: 55 }), 0.5],
        ["STD", createCourse({ averageEnrollment: 111 }), 1],
        ["LAB", createCourse({ averageEnrollment: 24 }), 0],
        ["LAB", createCourse({ averageEnrollment: 45 }), 1],
        ["FLD", createCourse({ averageEnrollment: 25 }), 0.5],
        ["AUTO", createCourse({ averageEnrollment: 149 }), 0],
        ["AUTO", createCourse({ averageEnrollment: 150 }), 0.25],
        ["AUTO", createCourse({ averageEnrollment: 250 }), 0.5],
        ["MAN", createCourse({ averageEnrollment: 150 }), 0.75],
        ["MAN", createCourse({ averageEnrollment: 250 }), 1.25],
        ["MODW", createCourse({ averageEnrollment: 99 }), 0],
        ["MODW", createCourse({ averageEnrollment: 100 }), 0.25],
        ["MODW", createCourse({ averageEnrollment: 250 }), 0.75],
        ["INT", createCourse({ averageEnrollment: 39 }), 0],
        ["INT", createCourse({ averageEnrollment: 40 }), 0.25],
        ["INT", createCourse({ averageEnrollment: 100 }), 0.75]
    ])("calculates %s support for visible threshold and rounding cases", (courseType, course, expected) => {
        expect(formulas[courseType].calculate(course)).toBe(expected);
    });

    it.each([
        [1.9, 80, 0],
        [2, 39, 0],
        [5, 80, 1]
    ])(
        "normalizes writing sections before calculating support",
        (averageSectionsPerCourse, averageEnrollment, expected) => {
            expect(
                formulas.WRT.calculate(
                    createCourse({
                        averageEnrollment,
                        averageSectionsPerCourse
                    })
                )
            ).toBe(expected);
        }
    );

    it("exports the annualization ratio used by request totals", () => {
        expect(annualizationRatio).toBeCloseTo(1 / 3);
    });
});
