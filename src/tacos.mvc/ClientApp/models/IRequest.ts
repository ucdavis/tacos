import { ICourse } from './ICourse';

export interface IRequest {
    id?: number;

    course: ICourse;
    courseNumber: string;
    courseType: string;
    requestType: string;
    calculatedTotal: number;
    annualizedTotal: number;
    exception: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    exceptionAnnualizedTotal: number;

    isDirty: boolean;
    isFocused: boolean;
  }
