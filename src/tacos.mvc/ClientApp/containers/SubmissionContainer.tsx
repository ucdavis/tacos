import * as React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import queryString from "query-string";

import Summary from "../components/Summary";
import CreateCourseModal from "../components/CreateCourseModal";
import RequestsTable from "../components/RequestsTable";

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
    isSaving: boolean;
    isSubmitting: boolean;
}

interface ICalculationResponse {
    calculatedTotal: number;
    annualizedTotal: number;
    exceptionAnnualizedTotal: number;
}

export default class SubmissionContainer extends React.Component<IProps, IState> {
    private calculationTokens: Record<string, number> = {};
    private nextClientStableId = 0;

    constructor(props: IProps) {
        super(props);

        const requests = this.normalizeRequests(props.requests || []);

        // TODO: hack for now, make everything dirty so it all gets processed
        for (const request of requests) {
            request.isDirty = true;
            request.isValid = true;
        }

        this.state = {
            requests,
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined,
            isProcessing: false,
            isSaving: false,
            isSubmitting: false
        };
    }

    public componentDidMount() {
        const { requests } = this.state;

        // tslint:disable-next-line:variable-name
        const [__host, __controller, __action, id] = location.pathname.split("/");
        const { jsAction } = queryString.parse(location.search);
        if (!jsAction) {
            return;
        }

        if (jsAction === "create") {
            // check if last request is already empty
            const lastRequest = requests[requests.length - 1];
            if (!lastRequest || !lastRequest.course || !lastRequest.course.number) {
                // focus request
                this.focusRequest(requests.length - 1);
                return;
            }

            this.onAddRequest();
            return;
        }

        if (jsAction === "edit" && requests) {
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
                    onRevoke={this.revokeRequest}
                    onCourseCreate={(i, c) => this.onOpenCourseCreate(i, c)}
                />
                <CreateCourseModal
                    isOpen={isCourseCreateOpen}
                    onClose={this.onCloseCourseCreate}
                    course={createCourseModel}
                    onCourseCreate={this.onCourseCreate}
                />
                <div className="row mb-4">
                    <div className="col d-flex">
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
                <Summary
                    canSave={canSave}
                    canSubmit={canSubmit}
                    total={this.submissionTotal()}
                    pending={pending}
                    onSave={this.save}
                    onSubmit={this.submit}
                    onReset={this.onReset}
                    isProcessing={this.state.isProcessing}
                    isSaving={this.state.isSaving}
                    isSubmitting={this.state.isSubmitting}
                />
                {this.onSavingModelRender()}
                {this.onSubmittingModelRender()}
            </div>
        );
    }

    private onSavingModelRender = () => {
        if (this.state.isSaving) {
            return (
                <div>
                    <Modal isOpen={true} centered={true}>
                        <ModalHeader>
                            <i className=" mr-3 fas fa-spinner fa-pulse fa-lg" />
                            Saving...
                        </ModalHeader>
                        <ModalBody className="d-flex justify-content-center taco-animation-container">
                            <img className="w-75" src="tacoAnimation.gif" alt="taco animation gif"/>
                        </ModalBody>
                    </Modal>
                </div>
            );
        }
    };
    
    private onSubmittingModelRender = () => {
        if (this.state.isSubmitting) {
            return (
                <div>
                    <Modal isOpen={true} centered={true}>
                        <ModalHeader>
                            <i className=" mr-3 fas fa-spinner fa-pulse fa-lg" />
                            Submitting...
                        </ModalHeader>
                        <ModalBody className="d-flex justify-content-center taco-animation-container">
                        <img className="w-75" src="tacoAnimation.gif" alt="taco animation gif"/>
                        </ModalBody>
                    </Modal>
                </div>
            );
        }
    };

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
    };

    private onReset = () => {
        const { department } = this.props;

        // reset the form
        if (confirm("Are you sure you want to clear this form and start over?")) {
            this.setState({
                requests: this.normalizeRequests(this.props.requests || [])
            });
        }
    };

    private checkIsValid = (): boolean => {
        const { requests } = this.state;

        // make sure we have at least one request
        if (requests.length === 0) {
            return false;
        }

        // make sure all requests are all valid or are being deleted
        if (!requests.filter(r => r.isDirty).every(r => r.isValid || r.isDeleted || false)) {
            return false;
        }

        return true;
    };

    private save = async () => {
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
                isSaving: true
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
            window.location.replace("/requests");
        } catch (err) {
            LogService.error(err);
        }
    };

    private submit = async () => {
        try {
            const { department } = this.props;
            const { requests } = this.state;

            // check validity
            const isValid = this.checkIsValid();
            if (!isValid) {
                return;
            }

            // lock down the submission button
            this.setState({
                isProcessing: true,
                isSubmitting: true
            });

            const validRequests = requests.filter(r => r.isValid);

            // create the submission, ship all requests
            const submission: ISubmission = {
                departmentId: department.id,
                requests: validRequests
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
            window.location.replace("/requests");
        } catch (err) {
            LogService.error(err);
        }
    };

    private revokeRequest = async (id:number) => {
        try {

            const response = await fetch(`/requests/Revoke/${id}`, {
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const result = await response.json();
            if (result.success === true) {
                window.location.reload();
            }

        } catch (err) {
            LogService.error(err);
        }
    };

    private focusRequest = (i: number) => {
        let request = this.state.requests[i];
        request = { ...request, isFocused: true };

        this.requestUpdated(i, request, false);

        // scroll to location
        let duration = 3;
        if (request.id) {
            window.location.hash = `request-${request.id}`;
        } else {
            duration = 0.5;
            window.scrollTo(0, document.body.scrollHeight);
        }

        // remove focus after 0.5 s
        setTimeout(() => {
            let unfocusRequest = this.state.requests[i];
            unfocusRequest = { ...unfocusRequest, isFocused: false };
            this.requestUpdated(i, unfocusRequest, false);
        }, duration * 1000);
    };

    private removeRequest = (i: number) => {
        const { requests } = this.state;

        LogService.info("removing request");
        let request = requests[i];
        if (request?.stableId) {
            delete this.calculationTokens[request.stableId];
        }

        // if this is an existing request, mark it as deleted, so that we can delete it on the server
        if (request.id) {
            request = { ...request, isDeleted: true };
            this.requestUpdated(i, request);
            return;
        }

        // else, remove it from new array
        const newRequests = requests.filter((r, rIndex) => rIndex !== i);
        this.setState({ requests: newRequests });
    };

    private requestUpdated = (i: number, request: IRequest, dirty: boolean = true) => {
        const { requests } = this.state;

        const shouldRecalculate = this.shouldRecalculate(requests[i], request);
        const preparedRequest = this.prepareRequest(i, request, requests, dirty);
        const newRequests = [...requests];
        newRequests[i] = preparedRequest;

        this.setState({ requests: newRequests }, () => {
            if (shouldRecalculate) {
                void this.calculateRequestTotals(preparedRequest);
            }
        });
    };

    private calculateRequestTotals = async (request: IRequest) => {
        const stableId = request.stableId;
        if (!stableId) {
            return;
        }

        const token = (this.calculationTokens[stableId] || 0) + 1;
        this.calculationTokens[stableId] = token;

        if (!request || !request.course || !request.courseNumber || request.isDeleted) {
            return;
        }

        try {
            const response = await fetch("/requests/calculate", {
                body: JSON.stringify(request),
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const totals: ICalculationResponse = await response.json();

            if (this.calculationTokens[stableId] !== token) {
                return;
            }

            this.setState((prevState) => {
                const index = prevState.requests.findIndex(current => current.stableId === stableId);
                if (index < 0) {
                    return null;
                }

                const currentRequest = prevState.requests[index];
                if (!currentRequest || currentRequest.isDeleted) {
                    return null;
                }

                const updatedRequest = this.validateRequest(index, {
                    ...currentRequest,
                    calculatedTotal: totals.calculatedTotal,
                    annualizedTotal: totals.annualizedTotal,
                    exceptionAnnualizedTotal: totals.exceptionAnnualizedTotal
                }, prevState.requests);

                const updatedRequests = [...prevState.requests];
                updatedRequests[index] = updatedRequest;

                return {
                    requests: updatedRequests
                };
            });
        } catch (err) {
            LogService.error(err);
        }
    };

    private prepareRequest = (index: number, request: IRequest, requests: IRequest[], dirty: boolean) => {
        const nextRequest = this.ensureStableId(this.hydrateRequest(request));

        if (!nextRequest.course || !nextRequest.courseNumber) {
            nextRequest.calculatedTotal = 0;
            nextRequest.annualizedTotal = 0;
            nextRequest.exceptionAnnualizedTotal = 0;
        }

        if (dirty) {
            nextRequest.isDirty = true;
        }

        const nextRequests = [...requests];
        nextRequests[index] = nextRequest;

        return this.validateRequest(index, nextRequest, nextRequests);
    };

    private hydrateRequest = (request: IRequest) => {
        const nextRequest = { ...request };

        if (nextRequest.course) {
            nextRequest.courseName = nextRequest.course.name;
            nextRequest.courseNumber = nextRequest.course.number;
        } else {
            nextRequest.courseName = "";
            nextRequest.courseNumber = "";
        }

        return nextRequest;
    };

    private validateRequest = (index: number, request: IRequest, requests: IRequest[]) => {
        const nextRequest = { ...request, isValid: true, error: "" };

        if (!nextRequest.course || !nextRequest.courseNumber) {
            nextRequest.isValid = false;
            nextRequest.error = "Course required";
        }

        if (nextRequest.course && nextRequest.course.isNew && !nextRequest.exception) {
            nextRequest.isValid = false;
            nextRequest.error = "Exception required with new courses";
        }

        if (nextRequest.exception && (nextRequest.exceptionTotal <= 0 || nextRequest.exceptionAnnualCount <= 0)) {
            nextRequest.isValid = false;
            nextRequest.error = "Exception values > 0 required";
        }

        const foundDuplicate = requests
            .filter((r, rIndex) => rIndex < index)
            .filter(r => !r.isDeleted)
            .find(r => r.courseNumber === nextRequest.courseNumber);

        if (foundDuplicate) {
            nextRequest.isValid = false;
            nextRequest.error = "Duplicate course in request above";
        }

        return nextRequest;
    };

    private shouldRecalculate = (currentRequest: IRequest | undefined, nextRequest: IRequest) => {
        if (!currentRequest) {
            return true;
        }

        const currentCourse = currentRequest.course;
        const nextCourse = nextRequest.course;

        return currentRequest.courseType !== nextRequest.courseType
            || currentRequest.exceptionTotal !== nextRequest.exceptionTotal
            || currentRequest.exceptionAnnualCount !== nextRequest.exceptionAnnualCount
            || currentCourse?.number !== nextCourse?.number
            || currentCourse?.averageEnrollment !== nextCourse?.averageEnrollment
            || currentCourse?.averageSectionsPerCourse !== nextCourse?.averageSectionsPerCourse
            || currentCourse?.timesOfferedPerYear !== nextCourse?.timesOfferedPerYear
            || currentCourse?.isCourseTaughtOnceEveryTwoYears !== nextCourse?.isCourseTaughtOnceEveryTwoYears
            || currentCourse?.wasCourseTaughtInMostRecentYear !== nextCourse?.wasCourseTaughtInMostRecentYear;
    };

    private onAddRequest = () => {
        const newRequests: IRequest[] = [
            ...this.state.requests,
            {
                stableId: this.createStableId(),
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
                exceptionAnnualCount: 0.0,
                exceptionAnnualizedTotal: 0,
                hasApprovedException: false,
                isValid: true,
            }
        ];

        this.setState({ requests: newRequests }, () => {
            // update isFocused to trigger ui flash
            const index = newRequests.length - 1;
            this.focusRequest(index);
        });
    };

    private onOpenCourseCreate = (index: number, defaultValues?: ICourse) => {
        const { requests } = this.state;
        const request = requests[index];

        this.setState({
            isCourseCreateOpen: true,
            createCourseIndex: index,
            createCourseModel: request.course || defaultValues
        });
    };

    private onCloseCourseCreate = () => {
        this.setState({
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined
        });
    };

    private onCourseCreate = (course: ICourse) => {
        const { requests, createCourseIndex } = this.state;

        if (createCourseIndex < 0) {
            return;
        }

        const request = requests[createCourseIndex];

        // clear modal data
        this.setState({
            isCourseCreateOpen: false,
            createCourseIndex: -1,
            createCourseModel: undefined
        });

        // update request, add course details, default with exception
        const newRequest = {
            ...request,
            course,
            exception: true
        };
        this.requestUpdated(createCourseIndex, newRequest);
    };

    private normalizeRequests = (requests: IRequest[]) => {
        return requests.map(request => this.ensureStableId({ ...request }));
    };

    private ensureStableId = (request: IRequest) => {
        if (request.stableId) {
            return request;
        }

        return {
            ...request,
            stableId: this.createStableId(request.id)
        };
    };

    private createStableId = (requestId?: number) => {
        if (requestId) {
            return `request-${requestId}`;
        }

        this.nextClientStableId += 1;
        return `client-${this.nextClientStableId}`;
    };
}
