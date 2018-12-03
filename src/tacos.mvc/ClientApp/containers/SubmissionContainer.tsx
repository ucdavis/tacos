import * as React from "react";

import Request from "../components/Request";
import Summary from "../components/Summary";
import Departments from "../components/Departments";

import { formulas } from "../util/formulas";

import * as LocalStorageService from "../services/LocalStorageService";

import { IRequest } from "../models/IRequest";
import { IDepartment } from "../models/IDepartment";
import { ISubmission } from "ClientApp/models/ISubmission";

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

        let requests = LocalStorageService.getRequests(props.department);
        if (!requests.length) {
            requests = props.requests || [];
        }

        this.state = {
            requests: requests
        };
    }

    public render() {
        return (
            <div>
                {this.renderRequests()}
                <Summary
                    canSubmit={this.isValidSubmission()}
                    total={this.submissionTotal()}
                    onSubmit={this.submit}
                    onReset={this.onReset}
                />
            </div>
        );
    }

    private submissionTotal = () => {
        const { requests } = this.state;

        // go add up everything they have requested
        const total = requests.reduce((acc, req) => {
            // add in exception total if exception, otherwise the annualized total
            const value = req.exception ? req.exceptionAnnualizedTotal : req.annualizedTotal;
            return acc + value;
        }, 0);

        return total;
    };

    private onReset = () => {
        const { department } = this.props;

        // reset the form, clear storage
        if (confirm("Are you sure you want to clear this form and start over?")) {
            LocalStorageService.clearRequests(department);
            this.setState({ requests: [] });
        }
    };

    private isValidSubmission = (): boolean => {
        // make sure we have at least one request
        if (this.state.requests.length === 0) {
            return false;
        }

        // submission is valid if every course is valid and every exception has a valid exceptionTotal
        return this.state.requests.every(
            r =>
                !!r.course &&
                !!r.course.number &&
                (!r.exception || (r.exception && r.exceptionTotal >= 0))
        );
    };

    private submit = async () => {
        try {
            const { department } = this.props;
            const { requests } = this.state;

            // filter just dirty submittions
            const dirtyRequests = requests.filter(r => r.isDirty);

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
            console.error(err);
        }
    };

    private requestUpdated = (i: number, request: IRequest) => {
        const { department } = this.props;

        const annualizationRatio = 4.0 / 12.0;
        // if the course info looks good, calculate totals
        request.calculatedTotal = formulas[request.courseType].calculate(request.course);

        request.exceptionAnnualizedTotal =
            request.exceptionTotal * annualizationRatio * request.course.timesOfferedPerYear;

        request.annualizedTotal =
            request.calculatedTotal * annualizationRatio * request.course.timesOfferedPerYear;

        request.isDirty = true;

        const requests = this.state.requests;
        requests[i] = request;

        LocalStorageService.saveRequests(department, requests);
        this.setState({ requests });
    };

    private removeRequest = (i: number) => {
        const { department } = this.props;
        console.log("removing request");

        const requests = [...this.state.requests];
        requests.splice(i, 1);

        LocalStorageService.saveRequests(department, requests);
        this.setState({ requests });
    };

    private renderRequests = () => {
        const requestList = this.state.requests.map((req, i) => (
            <Request
                key={`course-${i}`}
                request={req}
                index={i}
                onEdit={this.requestUpdated}
                onRemove={this.removeRequest}
            />
        ));

        return (
            <table className="table">
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
                {requestList}
                <tfoot>
                    <tr>
                        <td colSpan={5}>
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
    };

    private onAddRequest = () => {
        const requests: IRequest[] = [
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
                isDirty: true
            }
        ];

        this.setState({ requests });
    };
}
