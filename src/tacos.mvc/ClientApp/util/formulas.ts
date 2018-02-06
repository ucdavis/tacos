import { ICourse } from '../components/SubmissionContainer';

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
const standardLectureFormula : IFormula = {
    calculate: (course: ICourse) => {
        // Half-time TA per 55 students
        return (course.averageEnrollment / 55.0) * 55.5;
    }
}

// Writing intensive lecture classes with sections
// (GE writing or ≥10 page papers)
const writingLectureFormula : IFormula = {
    calculate: (course: ICourse) => {
        // "Discussion sections average 20-25 students
        // Half-time TA is responsible for 2 discussion sections, i.e. 40 students"		
        return (course.averageSectionsPerCourse / 2.0) * 0.5;
    }
}

// "Lab or studio classes 
// (Typically 2-3-hour lab or studio sections)"
const labFormula: IFormula = {
    calculate: (course: ICourse) => {
        // "Lab/studio sections average 15-20 students
        // Half-time TA is responsible for 2 lab/studio sections, i.e. 25-30 students
        // Alternative: 10-15 students per section if room size, equipment, or safety concerns require"
        return (course.averageEnrollment / 30.0) * 0.5;
    }
}

export const formulas : IFormulas = {
    "STD": standardLectureFormula,
    "WRT": writingLectureFormula,
    "LAB": labFormula
};