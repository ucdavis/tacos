import { IRequest } from "./IRequest";

export interface ISubmission {
    departmentId: number;
    requests: IRequest[];
}