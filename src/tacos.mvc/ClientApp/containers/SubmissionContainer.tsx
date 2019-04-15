import * as React from "react";
import { parse as QueryParse } from "query-string";

import Summary from "../components/Summary";
import CreateCourseModal from "../components/CreateCourseModal";
import RequestsTable from "../components/RequestsTable";

import { annualizationRatio, formulas } from "../util/formulas";

import * as LocalStorageService from "../services/LocalStorageService";
import * as LogService from "../services/LogService";

import { ICourse } from "../models/ICourse";
import { IRequest } from "../models/IRequest";
import { IDepartment } from "../models/IDepartment";
import { ISubmission } from "../models/ISubmission";

interface IProps {
    department: IDepartment;
    requests?: IRequest[];
}

interface IState {
    requests: IRequest[];

    isCourseCreateOpen: boolean;
    createCourseIndex: number;
    createCourseModel: ICourse | undefined;

    isProcessing: boolean;
}

export default class SubmissionContainer extends React.Component<IProps, IState> {
    
    constructor(props: IProps) {
        super(props);

        // check local storage first
        let requests = LocalStorageService.getRequests(props.department);
        if (!requests.length) {
            requests = props.requests || [];
        }

        this.state = {
            requests,
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined,
            isProcessing: false,
        };
    }

    public componentDidMount() {
        const { requests } = this.state;

        // tslint:disable-next-line:variable-name
        const [__host, __controller, __action, id] = location.pathname.split('/');
        const { jsAction } = QueryParse(location.search);
        if (!jsAction) {
            return;
        }

        if (jsAction === 'create') {
            // check if last request is already empty
            const lastRequest = requests[requests.length - 1];
            if (!lastRequest.course || !lastRequest.course.number) {
                // focus request
                this.focusRequest(requests.length - 1);
                return;
            }

            this.onAddRequest();
            return;
        }

        if (jsAction === 'edit' && requests) {
            const parsedId = parseInt(id, 10);
            if (!parsedId) {
                return;
            }

            // find matching request
            const index = requests.findIndex(r => r.id === parsedId);
            if (index < 0) {
                return;
            }

            const request = requests[index];

            // update isFocused to trigger ui flash
            this.focusRequest(index);

            // scroll to location
            window.location.hash = `request-${request.id}`;

            return;
        }
    }

    public render() {
        const { requests, isCourseCreateOpen, createCourseModel } = this.state;

        const pending = requests.filter(r => r.isDirty).length;

        const isValid = this.checkIsValid();

        const canSave = pending > 0 && isValid;
        const canSubmit = isValid;

        return (
            <div className="pb-4">
                <div className="row mb-4">
                    <div className="col d-flex justify-content-end">
                            <button
                                className="btn btn-primary"
                                id="submit-button"
                                onClick={this.onAddRequest}
                            >
                                Create New Request
                                <i className="fas fa-plus-circle ml-2" /> 
                            </button>
                    </div>
                </div>
                <RequestsTable
                    className="mb-4"
                    requests={requests}
                    onEdit={this.requestUpdated}
                    onRemove={this.removeRequest}
                    onCourseCreate={(i, c) => this.onOpenCourseCreate(i, c)}
                />
                <CreateCourseModal
                    isOpen={isCourseCreateOpen}
                    onClose={this.onCloseCourseCreate}
                    course={createCourseModel}
                    onCourseCreate={this.onCourseCreate}
                />
                <Summary
                    canSave={canSave}
                    canSubmit={canSubmit}
                    total={this.submissionTotal()}
                    pending={pending}
                    onSave={this.save}
                    onSubmit={this.submit}
                    onReset={this.onReset}
                    isProcessing={this.state.isProcessing}
                />
            </div>
        );
    }

    private submissionTotal = () => {
        const { requests } = this.state;

        // go add up everything they have requested
        const total = requests
            .filter(r => !r.isDeleted)
            .reduce((acc, req) => {
                // add in exception total if exception, otherwise the annualized total
                const value = req.exception ? req.exceptionAnnualizedTotal : req.annualizedTotal;
                return acc + value;
            }, 0);

        return total;
    }

    
    private onReset = () => {
        const { department } = this.props;

        // reset the form, clear storage
        if (confirm("Are you sure you want to clear this form and start over?")) {
            LocalStorageService.clearRequests(department);
            this.setState({
                requests: this.props.requests || [],
            });
        }
    }

    private checkIsValid = (): boolean => {
        const { requests } = this.state;

        // make sure we have at least one request
        if (requests.length === 0) {
            return false;
        }

        // make sure all dirty requests are all valid or are being deleted
        if (!requests.filter(r => r.isDirty).every(r => r.isValid || r.isDeleted || false)) {
            return false;
        }

        return true;
    }

    private save = async() => {
        try {
            const { department } = this.props;
            const { requests } = this.state;

            // filter just dirty submittions
            const dirtyRequests = requests.filter(r => r.isDirty);

            // check validity
            const isValid = this.checkIsValid();
            if (!isValid) {
                return;
            }

            // lock down the submission button
            this.setState({
                isProcessing: true,
            });

            // create the submission
            const submission: ISubmission = {
                departmentId: department.id,
                requests: dirtyRequests
            };

            const response = await fetch("/requests/save", {
                body: JSON.stringify(submission),
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const result = await response.json();

            // TODO: make sure we have success
            LocalStorageService.clearRequests(department);
            window.location.replace("/requests");
        } catch (err) {
            LogService.error(err);
        }
    }

    private submit = async () => {
        try {
            const { department } = this.props;
            const { requests } = this.state;

            // check validity
            const isValid = this.checkIsValid();
            if (!isValid) {
                return;
            }

            // create the submission, ship all requests
            const submission: ISubmission = {
                departmentId: department.id,
                requests
            };

            const response = await fetch("/requests/submit", {
                body: JSON.stringify(submission),
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const result = await response.json();

            // TODO: make sure we have success
            LocalStorageService.clearRequests(department);
            window.location.replace("/requests");
        } catch (err) {
            LogService.error(err);
        }
    }

    private focusRequest = (i: number) => {
        let request = this.state.requests[i];
        request = { ...request, isFocused: true };

        this.requestUpdated(i, request, false);

        // scroll to location
        window.location.hash = `request-${request.id}`;

        // remove focus after 5s
        setTimeout(() => {
            let unfocusRequest = this.state.requests[i];
            unfocusRequest = { ...unfocusRequest, isFocused: false };
            this.requestUpdated(i, unfocusRequest, false);
        }, 3 * 1000);
    }

    private removeRequest = (i: number) => {
        const { department } = this.props;
        const { requests } = this.state;

        LogService.info("removing request");
        let request = requests[i];

        // if this is an existing request, mark it as deleted, so that we can delete it on the server
        if (request.id) {
            request = { ...request, isDeleted: true };
            this.requestUpdated(i, request);
            return;
        }

        // else, remove it from new array
        const newRequests = requests.filter((r, rIndex) => rIndex !== i);
        LocalStorageService.saveRequests(department, newRequests);
        this.setState({ requests: newRequests });
    }

    private requestUpdated = (i: number, request: IRequest, dirty: boolean = true) => {
        const { department } = this.props;
        const { requests } = this.state;

        // flatten model
        if (request.course) {
            request.courseName = request.course.name;
            request.courseNumber = request.course.number;
        } else {
            request.courseName = "";
            request.courseNumber = "";
        }

        // if the course info looks good, calculate totals
        const formula = formulas[request.courseType];
        if (formula && request.course) {
            request.calculatedTotal = formula.calculate(request.course);
            request.annualizedTotal = request.calculatedTotal * annualizationRatio * request.course.timesOfferedPerYear;
            request.exceptionAnnualizedTotal = request.exceptionTotal * annualizationRatio * request.course.timesOfferedPerYear;
        }
        else {
            request.calculatedTotal = 0;
            request.annualizedTotal = 0;
            request.exceptionAnnualizedTotal = 0;
        }

        // clear error messages
        request.isValid = true;
        request.error = '';

        // check validity
        if (!request.course) {
            request.isValid = false;
            request.error = 'Course required';
        }

        if (!request.courseNumber) {
            request.isValid = false;
            request.error = 'Course required';
        }

        if (request.course && request.course.isNew && !request.exception) {
            request.isValid = false;
            request.error = 'Exception required with new courses';
        }

        if (request.exception && request.exceptionTotal <= 0) {
            request.isValid = false;
            request.error = 'Exception > 0 required';
        }

        // check for duplicate courses earlier in the array
        const foundDuplicate = requests
            .filter((r, rIndex) => rIndex < i)
            .filter(r => !r.isDeleted)
            .find(r => r.courseNumber === request.courseNumber);

        if (foundDuplicate) {
            request.isValid = false;
            request.error = 'Duplicate course in request above';
        }

        if (dirty) {
            request.isDirty = true;
        }

        // create new array and replace item
        const newRequests = [...requests];
        newRequests[i] = request;

        LocalStorageService.saveRequests(department, newRequests);
        this.setState({ requests: newRequests });

        // trigger validations
        this.checkIsValid();
    }

    private onAddRequest = () => {
        const { department } = this.props;

        const newRequests: IRequest[] = [
            ...this.state.requests,
            {
                course: undefined,
                courseName: "",
                courseNumber: "",
                courseType: "STD",
                requestType: "TA",
                calculatedTotal: 0,
                annualizedTotal: 0,
                exception: false,
                exceptionReason: "",
                exceptionTotal: 0.0,
                exceptionAnnualizedTotal: 0,
                isValid: true,
            }
        ];

        LocalStorageService.saveRequests(department, newRequests);
        this.setState({ requests: newRequests }, () => {
            // update isFocused to trigger ui flash
            const index = newRequests.length - 1;
            this.focusRequest(index);
        });
    }

    private onOpenCourseCreate = (index: number, defaultValues?: ICourse) => {
        const { requests } = this.state;
        const request = requests[index];

        this.setState({
            isCourseCreateOpen: true,
            createCourseIndex: index,
            createCourseModel: request.course || defaultValues,
        });
    }

    private onCloseCourseCreate = () => {
        this.setState({
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined,
        });
    }

    private onCourseCreate = (course: ICourse)  => {
        const { requests, createCourseIndex } = this.state;

        if (createCourseIndex < 0) {
            return;
        }

        const request = requests[createCourseIndex];

        // clear modal data
        this.setState({
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined,
        });

        // update request, add course details, default with exception
        const newRequest = {
            ...request,
            course,
            exception: true,
        };
        this.requestUpdated(createCourseIndex, newRequest);
    }
}
