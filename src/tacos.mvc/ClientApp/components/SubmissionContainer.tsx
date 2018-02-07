import * as React from "react";
import * as ReactDOM from "react-dom";
import Request from "./Request";
import Summary from "./Summary";
import { formulas } from "../util/formulas";

export interface IRequest {
  course: ICourse;
  courseType: string;
  requestType: string;
  calculatedTotal: number;
  contested: boolean;
  contestReason: string;
}

export interface ICourse {
  name: string;
  number: string;
  timesOfferedPerYear: number;
  averageSectionsPerCourse: number;
  averageEnrollment: number;
}

interface IState {
  department: string;
  requests: IRequest[];
}

export default class SubmissionContainer extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      department: "",
      requests: []
    };
  }
  componentDidMount() {
    // on mount, add the first request
    this.onAddRequest();
  }
  public render() {
    return (
      <div>
        {this.renderRequests()}
        <Summary canSubmit={true} onSubmit={this.submit} />
      </div>
    );
  }

  private submit = () => {
    // create the submission
    const submission = {
      metadata: "TODO",
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

    this.setState({ requests });
  };

  private renderRequests = () => {
    const requestList = this.state.requests.map((req, i) => (
      <Request
        key={`course-${i}`}
        request={req}
        index={i}
        onEdit={this.requestUpdated}
      />
    ));

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Course Number</th>
            <th>Course Type</th>
            <th>Request Type</th>
            <th>Result</th>
            <th>Contest?</th>
          </tr>
        </thead>
        <tbody>{requestList}</tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>
              <button className="btn btn-primary" onClick={this.onAddRequest}>
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
          averageSectionsPerCourse: 0
        },
        courseType: "STD",
        requestType: "TA",
        calculatedTotal: 0,
        contested: false,
        contestReason: ""
      }
    ];

    this.setState({ requests });
  };
}
