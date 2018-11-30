import { ICourse } from './ICourse';

export interface IRequest {
    course: ICourse;
    courseType: string;
    requestType: string;
    calculatedTotal: number;
    annualizedTotal: number;
    exception: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    exceptionAnnualizedTotal: number;
  }