import * as React from "react";
import queryString from "query-string";

import Summary from "../components/Summary";
import CreateCourseModal from "../components/CreateCourseModal";
import Modal, { ModalHeader, ModalBody } from "../components/Modal";
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

export default class SubmissionContainer extends React.Component<IProps, IState> {
    private static readonly recalculationDebounceMs = 250;

    private nextClientId = 1;
    private recalcTimeouts = new Map<string, number>();
    private recalcRequestVersions = new Map<string, number>();
    private isUnmounted = false;

    constructor(props: IProps) {
        super(props);

        const requests = this.initializeRequests(props.requests || []);

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

    public componentWillUnmount() {
        this.isUnmounted = true;

        for (const timeoutId of this.recalcTimeouts.values()) {
            window.clearTimeout(timeoutId);
        }

        this.recalcTimeouts.clear();
        this.recalcRequestVersions.clear();
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
            const lastRequestIndex = requests.length - 1;
            const lastRequest = requests[lastRequestIndex];

            // check if last request is already empty
            if (lastRequest && (!lastRequest.course || !lastRequest.course.number)) {
                // focus request
                this.focusRequest(lastRequestIndex);
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
            <div className="tacos-page-with-summary">
                <div className="tacos-action-row tacos-action-row--end">
                    <button
                        className="tacos-btn tacos-btn--primary"
                        onClick={this.onAddRequest}
                        type="button"
                    >
                        Create New Request
                        <i className="fas fa-plus-circle tacos-btn__icon" />
                    </button>
                </div>
                <RequestsTable
                    className="tacos-section-gap"
                    requests={requests}
                    onEdit={this.requestUpdated}
                    onRemove={this.removeRequest}
                    onRevoke={this.revokeRequest}
                    onCourseCreate={this.onOpenCourseCreate}
                />
                <CreateCourseModal
                    isOpen={isCourseCreateOpen}
                    onClose={this.onCloseCourseCreate}
                    course={createCourseModel}
                    onCourseCreate={this.onCourseCreate}
                />
                <div className="tacos-action-row">
                    <button
                        className="tacos-btn tacos-btn--primary"
                        onClick={this.onAddRequest}
                        type="button"
                    >
                        Create New Request
                        <i className="fas fa-plus-circle tacos-btn__icon" />
                    </button>
                </div>
                <Summary
                    canSave={canSave}
                    canSubmit={canSubmit}
                    taTotal={this.submissionTaTotal()}
                    readerTotal={this.submissionReaderTotal()}
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
                            <i className="fas fa-spinner fa-pulse fa-lg tacos-inline-icon-start" />
                            Saving...
                        </ModalHeader>
                        <ModalBody className="taco-animation-container tacos-modal-body-centered">
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
                            <i className="fas fa-spinner fa-pulse fa-lg tacos-inline-icon-start" />
                            Submitting...
                        </ModalHeader>
                        <ModalBody className="taco-animation-container tacos-modal-body-centered">
                        <img className="w-75" src="tacoAnimation.gif" alt="taco animation gif"/>
                        </ModalBody>
                    </Modal>
                </div>
            );
        }
    };

    private submissionTaTotal = () => {
        const { requests } = this.state;

        return requests
            .filter(r => !r.isDeleted)
            .reduce((acc, req) => {
                const value = req.exception ? req.exceptionAnnualizedTaTotal : req.annualizedTaTotal;
                return acc + value;
            }, 0);
    };

    private submissionReaderTotal = () => {
        const { requests } = this.state;

        return requests
            .filter(r => !r.isDeleted)
            .reduce((acc, req) => {
                const value = req.exception ? req.exceptionAnnualizedReaderTotal : req.annualizedReaderTotal;
                return acc + value;
            }, 0);
    };

    private onReset = () => {
        // reset the form
        if (confirm("Are you sure you want to clear this form and start over?")) {
            for (const timeoutId of this.recalcTimeouts.values()) {
                window.clearTimeout(timeoutId);
            }

            this.recalcTimeouts.clear();
            this.recalcRequestVersions.clear();

            this.setState({
                requests: this.initializeRequests(this.props.requests || [])
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

        this.requestUpdated(i, request, false, false);

        // scroll to location
        const duration = request.id ? 3 : 0.5;
        window.location.hash = request.id ? `request-${request.id}` : `request-new-${i}`;

        // remove focus after 0.5 s
        setTimeout(() => {
            let unfocusRequest = this.state.requests[i];
            unfocusRequest = { ...unfocusRequest, isFocused: false };
            this.requestUpdated(i, unfocusRequest, false, false);
        }, duration * 1000);
    };

    private removeRequest = (i: number) => {
        const { department } = this.props;
        const { requests } = this.state;

        LogService.info("removing request");
        let request = requests[i];

        // if this is an existing request, mark it as deleted, so that we can delete it on the server
        if (request.id) {
            request = { ...request, isDeleted: true };
            this.requestUpdated(i, request, true, false);
            return;
        }

        // else, remove it from new array
        const newRequests = requests.filter((r, rIndex) => rIndex !== i);
        this.setState({ requests: newRequests });
    };

    private requestUpdated = (i: number, request: IRequest, dirty: boolean = true, recalculate: boolean = true) => {
        const { requests } = this.state;

        // flatten model
        if (request.course) {
            request.courseName = request.course.name;
            request.courseNumber = request.course.number;
        } else {
            request.courseName = "";
            request.courseNumber = "";
        }

        // clear error messages
        request.isValid = true;
        request.error = "";

        // check validity
        if (!request.course) {
            request.isValid = false;
            request.error = "Course required";
        }

        if (!request.courseNumber) {
            request.isValid = false;
            request.error = "Course required";
        }

        if (request.course && request.course.isNew && !request.exception) {
            request.isValid = false;
            request.error = "Exception required with new courses";
        }

        if (
            request.exception
            && (
                (request.exceptionTaTotal <= 0 && request.exceptionReaderTotal <= 0)
                || request.exceptionAnnualCount <= 0
            )
        ) {
            request.isValid = false;
            request.error = "Exception values > 0 required";
        }

        // check for duplicate courses earlier in the array
        const foundDuplicate = requests
            .filter((r, rIndex) => rIndex < i)
            .filter(r => !r.isDeleted)
            .find(r => r.courseNumber === request.courseNumber);

        if (foundDuplicate) {
            request.isValid = false;
            request.error = "Duplicate course in request above";
        }

        if (dirty) {
            request.isDirty = true;
        }

        if (recalculate) {
            request.calculationError = undefined;
            request.isRecalculating = this.shouldRecalculate(request);

            if (!request.isRecalculating) {
                this.clearDerivedTotals(request);
            }
        }

        // create new array and replace item
        const newRequests = [...requests];
        newRequests[i] = request;

        this.setState({ requests: newRequests }, () => {
            if (recalculate) {
                this.scheduleRecalculation(request);
            }
        });

        // trigger validations
        this.checkIsValid();
    };

    private onAddRequest = () => {
        const newRequests: IRequest[] = [
            ...this.state.requests,
            {
                course: undefined,
                courseName: "",
                courseNumber: "",
                courseType: "STD",
                clientId: this.createClientId(),
                calculatedTaTotal: 0,
                calculatedReaderTotal: 0,
                annualizedTaTotal: 0,
                annualizedReaderTotal: 0,
                exception: false,
                exceptionReason: "",
                exceptionTaTotal: 0.0,
                exceptionReaderTotal: 0.0,
                exceptionAnnualCount: 0.0,
                exceptionAnnualizedTaTotal: 0,
                exceptionAnnualizedReaderTotal: 0,
                hasApprovedException: false,
                isRecalculating: false,
                isValid: true,
            },
        ];
        const newRequestIndex = newRequests.length - 1;

        this.setState({ requests: newRequests }, () => {
            // update isFocused to trigger ui flash
            this.focusRequest(newRequestIndex);
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

    private initializeRequests = (requests: IRequest[]): IRequest[] => {
        return requests.map((request) => ({
            ...request,
            clientId: request.clientId || this.createClientId(),
            calculationError: undefined,
            isDirty: true,
            isRecalculating: false,
            isValid: true,
        }));
    };

    private createClientId = (): string => {
        const clientId = `request-${this.nextClientId}`;
        this.nextClientId += 1;
        return clientId;
    };

    private shouldRecalculate = (request: IRequest): boolean => {
        return !!request.course && !!request.courseNumber && !!request.courseType && !request.isDeleted;
    };

    private clearDerivedTotals = (request: IRequest) => {
        request.calculatedTaTotal = 0;
        request.calculatedReaderTotal = 0;
        request.annualizedTaTotal = 0;
        request.annualizedReaderTotal = 0;
        request.exceptionAnnualizedTaTotal = 0;
        request.exceptionAnnualizedReaderTotal = 0;
        request.isRecalculating = false;
    };

    private scheduleRecalculation = (request: IRequest) => {
        const clientId = request.clientId;
        if (!clientId) {
            return;
        }

        const existingTimeout = this.recalcTimeouts.get(clientId);
        if (existingTimeout !== undefined) {
            window.clearTimeout(existingTimeout);
        }

        if (!this.shouldRecalculate(request)) {
            this.recalcTimeouts.delete(clientId);
            this.recalcRequestVersions.delete(clientId);
            return;
        }

        const requestVersion = (this.recalcRequestVersions.get(clientId) || 0) + 1;
        this.recalcRequestVersions.set(clientId, requestVersion);

        const requestSnapshot = this.buildRecalculationRequest(request);
        const timeoutId = window.setTimeout(() => {
            this.recalcTimeouts.delete(clientId);
            void this.recalculateRequest(clientId, requestVersion, requestSnapshot);
        }, SubmissionContainer.recalculationDebounceMs);

        this.recalcTimeouts.set(clientId, timeoutId);
    };

    private recalculateRequest = async (
        clientId: string,
        requestVersion: number,
        requestSnapshot: Record<string, unknown>,
    ) => {
        try {
            const response = await fetch("/requests/recalculate", {
                body: JSON.stringify(requestSnapshot),
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(response.statusText || "Recalculation failed.");
            }

            const result = await response.json() as {
                calculatedTaTotal: number;
                calculatedReaderTotal: number;
                annualizedTaTotal: number;
                annualizedReaderTotal: number;
                exceptionAnnualizedTaTotal: number;
                exceptionAnnualizedReaderTotal: number;
            };

            this.setState((state) => {
                if (this.isStaleRecalculation(clientId, requestVersion)) {
                    return null;
                }

                const requestIndex = state.requests.findIndex(r => r.clientId === clientId);
                if (requestIndex < 0) {
                    return null;
                }

                const request = {
                    ...state.requests[requestIndex],
                    calculatedTaTotal: result.calculatedTaTotal,
                    calculatedReaderTotal: result.calculatedReaderTotal,
                    annualizedTaTotal: result.annualizedTaTotal,
                    annualizedReaderTotal: result.annualizedReaderTotal,
                    exceptionAnnualizedTaTotal: result.exceptionAnnualizedTaTotal,
                    exceptionAnnualizedReaderTotal: result.exceptionAnnualizedReaderTotal,
                    calculationError: undefined,
                    isRecalculating: false,
                };

                const requests = [...state.requests];
                requests[requestIndex] = request;

                return { requests };
            });
        } catch (err) {
            LogService.error(err);

            this.setState((state) => {
                if (this.isStaleRecalculation(clientId, requestVersion)) {
                    return null;
                }

                const requestIndex = state.requests.findIndex(r => r.clientId === clientId);
                if (requestIndex < 0) {
                    return null;
                }

                const request = {
                    ...state.requests[requestIndex],
                    calculationError: "Unable to refresh calculated totals. Save or submit will recalculate on the server.",
                    isRecalculating: false,
                };

                const requests = [...state.requests];
                requests[requestIndex] = request;

                return { requests };
            });
        }
    };

    private isStaleRecalculation = (clientId: string, requestVersion: number): boolean => {
        return this.isUnmounted || this.recalcRequestVersions.get(clientId) !== requestVersion;
    };

    private buildRecalculationRequest = (request: IRequest): Record<string, unknown> => {
        const payload: Record<string, unknown> = {
            departmentId: this.props.department.id,
            courseNumber: request.courseNumber,
            courseType: request.courseType,
            exception: request.exception,
            exceptionTaTotal: request.exceptionTaTotal,
            exceptionReaderTotal: request.exceptionReaderTotal,
            exceptionAnnualCount: request.exceptionAnnualCount,
        };

        if (request.course) {
            payload.course = {
                number: request.course.number,
                name: request.course.name,
                averageEnrollment: request.course.averageEnrollment,
                averageSectionsPerCourse: request.course.averageSectionsPerCourse,
                timesOfferedPerYear: request.course.timesOfferedPerYear,
                wasCourseTaughtInMostRecentYear: request.course.wasCourseTaughtInMostRecentYear,
                isCourseTaughtOnceEveryTwoYears: request.course.isCourseTaughtOnceEveryTwoYears,
            };
        }

        return payload;
    };
}
