import * as React from "react";

import Request from "../components/Request";
import Summary from "../components/Summary";
import Departments from "../components/Departments";

import { formulas } from "../util/formulas";

import { IRequest } from '../models/IRequest';
import { IDepartment } from "../models/IDepartment";
import { ISubmission } from "ClientApp/models/ISubmission";

interface IProps {
  departments: IDepartment[];
}

interface IState {
  selectedDepartmentId: number;
  requests: IRequest[];
}

export default class SubmissionContainer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    const selectedDepartmentId = props.departments[0].id;

    this.state = {
      selectedDepartmentId,
      requests: []
    };
  }

  componentDidMount() {
    // reload state from local storage
    const existingRequestString = localStorage.getItem("requests");

    if (existingRequestString) {
      this.setState({ requests: JSON.parse(existingRequestString) });
    } else {
      this.onAddRequest(); // add a starter one
    }

    const selectedDepartmentId = localStorage.getItem("selectedDepartmentId");

    if (selectedDepartmentId) {
      this.setState({ selectedDepartmentId: parseInt(selectedDepartmentId, 10) });
    }
  }

  public render() {
    const { departments } = this.props;
    const { selectedDepartmentId } = this.state;

    return (
      <div>
        <Departments
          departmentId={selectedDepartmentId}
          departments={departments}
          onChange={this.onDepartmentChange}
        />
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

  private onDepartmentChange = (value: number) => {
    this.setState({ selectedDepartmentId: value });

    localStorage.setItem("selectedDepartmentId", `${value}`);
  };

  private submissionTotal = () => {
    const { requests } = this.state;

    // go add up everything they have requested
    const total = requests.reduce((acc, req) => {
      // add in exception total if exception, otherwise the annualized total
      const value = (req.exception ? req.exceptionAnnualizedTotal : req.annualizedTotal);
      return acc + value;
    }, 0);

    return total;
  };

  private onReset = () => {
    // reset the form, clear storage
    if (confirm("Are you sure you want to clear this form and start over?")) {
      localStorage.removeItem("requests");
      localStorage.removeItem("selectedDepartmentId");
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
        (!!r.course && !!r.course.number) &&
        (!r.exception || (r.exception && r.exceptionTotal >= 0))
    );
  };

  private submit = () => {
    const { selectedDepartmentId, requests } = this.state;

    // create the submission
    const submission: ISubmission = {
      departmentId: selectedDepartmentId,
      requests: requests
    };

    fetch("/requests/create", {
      body: JSON.stringify(submission),
      headers: [
        ["Accept", "application/json"],
        ["Content-Type", "application/json"]
      ],
      method: "POST",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }

        return res.json();
      })
      .then(res => {
        // TODO: make sure we have success
        localStorage.removeItem("requests");
        window.location.replace("/requests");
      })
      .catch(console.error);
  };

  private requestUpdated = (i: number, request: IRequest) => {
    const annualizationRatio = 4.0 / 12.0;
    // if the course info looks good, calculate totals
    request.calculatedTotal = formulas[request.courseType].calculate(
      request.course
    );

    request.exceptionAnnualizedTotal = request.exceptionTotal * annualizationRatio * request.course.timesOfferedPerYear;

    request.annualizedTotal =
      request.calculatedTotal * annualizationRatio * request.course.timesOfferedPerYear;

    const requests = this.state.requests;
    requests[i] = request;

    localStorage.setItem("requests", JSON.stringify(requests));

    this.setState({ requests });
  };

  private removeRequest = (i: number) => {
    console.log("remove request");

    const requests = [...this.state.requests];
    requests.splice(i, 1);

    localStorage.setItem("requests", JSON.stringify(requests));

    this.setState({
      requests
    });
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
              Course Type
              &nbsp;&nbsp;
                <a target="_blank" href="/CAES-TA-Guidelines 2018-21.pdf">
                  Criteria Info  <i className="fas fa-external-link-alt"></i>
                </a>
                
            </th>
            <th>
              <span data-toggle="tooltip" data-placement="top" title="For courses that require both TAs and Readers, select the majority position type.">
                Request Type <i className="fas fa-question-circle"></i>
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
    const requests = [
      ...this.state.requests,
      {
        course: {
          name: "",
          number: "",
          timesOfferedPerYear: 0,
          averageEnrollment: 0,
          averageSectionsPerCourse: 0,
          valid: false
        },
        courseType: "STD",
        requestType: "TA",
        calculatedTotal: 0,
        annualizedTotal: 0,
        exception: false,
        exceptionReason: "",
        exceptionTotal: 0.00,
        exceptionAnnualizedTotal: 0,
      }
    ];

    this.setState({ requests });
  };
}
