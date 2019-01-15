import * as React from "react";
import { parse as QueryParse } from "query-string";

import Request from "../components/Request";
import Summary from "../components/Summary";

import { annualizationRatio, formulas } from "../util/formulas";

import * as LocalStorageService from "../services/LocalStorageService";
import * as LogService from "../services/LogService";

import { IRequest } from "../models/IRequest";
import { IDepartment } from "../models/IDepartment";
import { ISubmission } from "../models/ISubmission";

interface IProps {
    department: IDepartment;
    requests?: IRequest[];
}

interface IState {
    requests: IRequest[];
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
        };
    }

    public componentDidMount() {
        const { requests } = this.props;

        // tslint:disable-next-line:variable-name
        const [__host, __controller, __action, id] = location.pathname.split('/');
        const { jsAction } = QueryParse(location.search);
        if (!jsAction) {
            return;
        }

        if (jsAction === 'create') {
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
        const { requests } = this.state;

        const pending = requests.filter(r => r.isDirty).length;

        const isValid = this.checkIsValid();

        return (
            <div>
                {this.renderRequests()}
                <Summary
                    canSubmit={isValid}
                    total={this.submissionTotal()}
                    pending={pending}
                    onSubmit={this.submit}
                    onReset={this.onReset}
                />
            </div>
        );
    }

    private renderRequests = () => {
        const { requests } = this.state;

        return (
            <table className="table requests">
                <thead>
                    <tr>
                        <th>Course Number</th>
                        <th>
                            Course Type &nbsp;&nbsp;
                            <a target="_blank" href="/CAES-TA-Guidelines 2018-21.pdf">
                                Criteria Info <i className="fas fa-external-link-alt" />
                            </a>
                        </th>
                        <th>
                            <span
                                data-toggle="tooltip"
                                data-placement="top"
                                title="For courses that require both TAs and Readers, select the majority position type."
                            >
                                Request Type <i className="fas fa-question-circle" />
                            </span>
                        </th>
                        <th>TAs per course</th>
                        <th>Annual TA FTE</th>
                        <th>Exception?</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                { requests.map(this.renderRequest) }
                <tfoot>
                    <tr>
                        <td colSpan={7}>
                            <button
                                className="btn btn-primary"
                                id="add-new"
                                onClick={this.onAddRequest}
                            >
                                Add New
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    }

    private renderRequest = (request: IRequest, index: number) => {
        if (request.isDeleted) {
            return null;
        }

        return (
            <Request
                key={`course-${index}`}
                request={request}
                index={index}
                onEdit={this.requestUpdated}
                onRemove={this.removeRequest}
            />
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

    private submit = async () => {
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

            // create the submission
            const submission: ISubmission = {
                departmentId: department.id,
                requests: dirtyRequests
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

        // if the course info looks good, calculate totals
        request.calculatedTotal = formulas[request.courseType].calculate(request.course);

        request.annualizedTotal = request.calculatedTotal * annualizationRatio * request.course.timesOfferedPerYear;
        request.exceptionAnnualizedTotal = request.exceptionTotal * annualizationRatio * request.course.timesOfferedPerYear;

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
                course: {
                    name: "",
                    number: "",
                    timesOfferedPerYear: 0,
                    averageEnrollment: 0,
                    averageSectionsPerCourse: 0
                },
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
        this.setState({ requests: newRequests });
    }
}
