import { ICourse } from "./ICourse";

export interface IRequest {
    id?: number;

    course: ICourse | undefined;

    // flattened course value
    courseName: string;

    // flattened course value
    courseNumber: string;

    courseType: string;
    calculatedTotal: number;
    calculatedTaTotal: number;
    calculatedReaderTotal: number;
    annualizedTotal: number;
    annualizedTaTotal: number;
    annualizedReaderTotal: number;
    exception: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    exceptionTaTotal: number;
    exceptionReaderTotal: number;
    exceptionAnnualCount: number;
    exceptionAnnualizedTotal: number;
    exceptionAnnualizedTaTotal: number;
    exceptionAnnualizedReaderTotal: number;
    hasApprovedException: boolean;

    isDirty?: boolean;
    isFocused?: boolean;
    isDeleted?: boolean;

    error?: string;
    isValid?: boolean;
}
