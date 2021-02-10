export interface ICourse {
    name: string;
    number: string;
    timesOfferedPerYear: number;
    averageSectionsPerCourse: number;
    averageEnrollment: number;
    isCrossListed: boolean;
    crossListingsString: string;
    isOfferedWithinPastTwoYears: boolean;
    wasCourseTaughtInMostRecentYear: boolean;
    isCourseTaughtOnceEveryTwoYears: boolean;

    isNew: boolean;
}
