
import { IRequest } from "../models/IRequest";
import { IDepartment } from "../models/IDepartment";

export interface IStorage {
    requests: IRequest[];
    updatedOn: Date;
}

function getStorageKey(department: IDepartment): string {
    return `requests-${department.code}`;
}

export function getRequests(department: IDepartment): IRequest[] {
    const key = getStorageKey(department);
    const result = localStorage.getItem(key);
    if (!result) {
        return [];
    }

    const storage: IStorage = JSON.parse(result);
    return storage.requests;
}

export function saveRequests(department: IDepartment, requests: IRequest[]) {
    const key = getStorageKey(department);

    // don't save isFocused: true
    const data = requests.map((r) => {
        return { 
            ...r,
            isFocused: false,
        };
    });

    const storage: IStorage = {
        requests: data,
        updatedOn: new Date(),
    }

    localStorage.setItem(key, JSON.stringify(storage));
}

export function clearRequests(department: IDepartment) {
    const key = getStorageKey(department);
    localStorage.removeItem(key);
}
