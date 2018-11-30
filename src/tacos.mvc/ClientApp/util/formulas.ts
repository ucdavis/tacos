import { ICourse } from "../models/ICourse";

// dictionary where props are equal to different course types

// each entry is an object of type IFormula
export interface IFormula {
  calculate: (course: ICourse) => number;
}

interface IFormulas {
  [prop: string]: IFormula;
}

// Standard lecture classes with sections
// (Grading is through tests and/or short papers; sections typically 1 hour )
const standardLectureFormula: IFormula = {
  calculate: (course: ICourse) => {
    // minimum enrollment
    if (course.averageEnrollment < 55.0) return 0;

    // Half-time TA per 55 students for courses with 55 or more students
    return roundTo(course.averageEnrollment / 55.0 * 0.5, 0.5);
  }
};

// Writing intensive lecture classes with sections
// (GE writing or ≥10 page papers)
const writingLectureFormula: IFormula = {
  calculate: (course: ICourse) => {
    // minimum enrollment
    if (course.averageEnrollment / course.averageSectionsPerCourse <= 15.0)
      return 0;

    // "Discussion sections average 20-25 students
    // Half-time TA is responsible for 2 discussion sections, i.e. 40 students"
    return roundTo(course.averageSectionsPerCourse / 2.0 * 0.5, 0.5);
  }
};

// "Lab or studio classes
// (Typically 2-3-hour lab or studio sections)"
const labFormula: IFormula = {
  calculate: (course: ICourse) => {
    // "Lab/studio sections average 15-20 students
    // Half-time TA is responsible for 2 lab/studio sections, i.e. 25-30 students
    // Alternative: 10-15 students per section if room size, equipment, or safety concerns require"
    return roundTo(course.averageEnrollment / 30.0 * 0.5, 0.5);
  }
};

// Field courses
const fieldFormula: IFormula = {
  calculate: (course: ICourse) => {
    // Half-time TA per 25 students
    return roundTo(course.averageEnrollment / 25.0 * 0.5, 0.5);
  }
};

// "Lecture-only classes, automated grading
// (No sections; grading is by Scantron or similar)"
const lectureAutoGradingFormula: IFormula = {
  calculate: (course: ICourse) => {
    // 25% TA or Reader for first 150 students for courses with 150 or more students
    // Additional 25% TA or Reader for each 100 after that
    if (course.averageEnrollment < 150) return 0;

    return roundTo(
      0.25 + (course.averageEnrollment - 150) / 100.0 * 0.25,
      0.25
    );
  }
};

// "Lecture-only classes, manual grading
// (Tests require grader attention)"
const lectureManualGradingFormula: IFormula = {
  calculate: (course: ICourse) => {
    // 25% TA or Reader for first 150 students for courses with 150 or more students
    // Additional 25% TA or Reader for each 100 after that.
    // Plus, 25% of a TA or Reader per 100 students
    if (course.averageEnrollment < 150) return 0;

    return roundTo(
      0.25 +
        (course.averageEnrollment - 150) / 100.0 * 0.25 +
        course.averageEnrollment / 100.0 * 0.25,
      0.25
    );
  }
};

// "Lecture-only classes, moderate writing
// (5-10 page papers)"
const lectureModerateWritingFormula: IFormula = {
  calculate: (course: ICourse) => {
    // 25% TA or Reader per 100 students for courses with 100 or more students
    if (course.averageEnrollment < 100) return 0;

    return roundTo(course.averageEnrollment / 100.0 * 0.25, 0.25);
  }
};

// "Lecture-only classes, writing-intensive or substantial project
// (No sections; GE writing or ≥10 page papers: ' substantial project’ is a project that comprises at least 25% of the total course grade and requires input from faculty/TA’s over more than one class meeting for organization, planning, implementation, and/or evaluation/grading of student work"
const lectureIntensiveFormula: IFormula = {
  calculate: (course: ICourse) => {
    // 25% TA or Reader per 40 students for courses with 40 or more students
    if (course.averageEnrollment < 40) return 0;

    return roundTo(course.averageEnrollment / 40.0 * 0.25, 0.25);
  }
};

function roundTo(number: number, round: number): number {
  return round * Math.round(number / round);
}

export const formulas: IFormulas = {
  STD: standardLectureFormula,
  WRT: writingLectureFormula,
  LAB: labFormula,
  FLD: fieldFormula,
  AUTO: lectureAutoGradingFormula,
  MAN: lectureManualGradingFormula,
  MODW: lectureModerateWritingFormula,
  INT: lectureIntensiveFormula
};
