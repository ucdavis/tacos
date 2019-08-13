import { ICourse } from "./ICourse";

export interface IRequest {
    id?: number;

    course: ICourse | undefined;

    // flattened course value
    courseName: string;

    // flattened course value
    courseNumber: string;

    courseType: string;
    requestType: string;
    calculatedTotal: number;
    annualizedTotal: number;
    exception: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    exceptionAnnualizedTotal: number;
    hasApprovedException: boolean;

    isDirty?: boolean;
    isFocused?: boolean;
    isDeleted?: boolean;

    error?: string;
    isValid?: boolean;
}
