import * as React from "react";
import * as ReactDOM from "react-dom";
import Request from "./Request";
import Summary from "./Summary";
import Departments from "./Departments";
import { formulas } from "../util/formulas";

export interface IRequest {
  course: ICourse;
  courseType: string;
  requestType: string;
  calculatedTotal: number;
  contested: boolean;
  contestReason: string;
  contestTotal: number;
}

export interface ICourse {
  name: string;
  number: string;
  timesOfferedPerYear: number;
  averageSectionsPerCourse: number;
  averageEnrollment: number;
  valid: boolean;
}

interface IState {
  department: string;
  requests: IRequest[];
}

export default class SubmissionContainer extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      department: "APLS",
      requests: []
    };
  }
  componentDidMount() {
    const existingRequestString = localStorage.getItem("requests");

    if (existingRequestString) {
      this.setState({ requests: JSON.parse(existingRequestString) });
    } else {
      this.onAddRequest(); // add a starter one
    }

    const existingDepartment = localStorage.getItem("department");

    if (existingDepartment) {
      this.setState({ department: existingDepartment });
    }
  }
  public render() {
    return (
      <div>
        <Departments
          department={this.state.department}
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

  private onDepartmentChange = (department: string) => {
    this.setState({ department });

    localStorage.setItem("department", department);
  };

  private submissionTotal = () => {
    // go add up everything they have requested
    const total = this.state.requests.reduce((acc, req) => {
      // add in contested total if contested, otherwise the calc total
      return acc + (req.contested ? req.contestTotal : req.calculatedTotal);
    }, 0);

    return total;
  };

  private onReset = () => {
    // reset the form, clear storage
    if (confirm("Are you sure you want to clear this form and start over?")) {
      localStorage.removeItem("requests");
      localStorage.removeItem("department");
      this.setState({ requests: [] });
    }
  };

  private isValidSubmission = (): boolean => {
    // make sure we have at least one request
    if (this.state.requests.length === 0) {
      return false;
    }

    // submission is valid if every course is valid and every contest has a valid contestTotal
    return this.state.requests.every(
      r =>
        r.course.valid && (!r.contested || (r.contested && r.contestTotal >= 0))
    );
  };

  private submit = () => {
    // create the submission
    const submission = {
      department: this.state.department,
      requests: this.state.requests
    };

    fetch("/submission/create", {
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
        window.location.replace("/submission");
      })
      .catch(console.error);
  };

  private requestUpdated = (i: number, request: IRequest) => {
    console.log("update request", request);

    // if the course info looks good, calculate totals
    if (true) {
      // TODO: figure out valid course?
      request.calculatedTotal = formulas[request.courseType].calculate(
        request.course
      );
    }

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
            <th>Course Type</th>
            <th>Avg Enrollment</th>
            <th>Avg Sections</th>
            <th>Request Type</th>
            <th>Result</th>
            <th>Contest?</th>
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
        contested: false,
        contestReason: "",
        contestTotal: 0
      }
    ];

    this.setState({ requests });
  };
}
