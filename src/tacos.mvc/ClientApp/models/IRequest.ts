import { ICourse } from "./ICourse";

export interface IRequest {
    id?: number;

    course: ICourse | undefined;

    // flattened course value
    courseName: string;

    // flattened course value
    courseNumber: string;

    courseType: string;
    calculatedTaTotal: number;
    calculatedReaderTotal: number;
    annualizedTaTotal: number;
    annualizedReaderTotal: number;
    exception: boolean;
    exceptionReason: string;
    exceptionTaTotal: number;
    exceptionReaderTotal: number;
    exceptionAnnualCount: number;
    exceptionAnnualizedTaTotal: number;
    exceptionAnnualizedReaderTotal: number;
    hasApprovedException: boolean;

    isDirty?: boolean;
    isFocused?: boolean;
    isDeleted?: boolean;

    error?: string;
    isValid?: boolean;
}
