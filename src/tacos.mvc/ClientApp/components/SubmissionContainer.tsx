import * as React from "react";
import * as ReactDOM from "react-dom";
import Request from "./Request";
import Summary from "./Summary";

export interface IRequest {
  courseNumber: string;
  courseType: string;
  requestType: string;
  result: number;
  contest: boolean;
  contestReason: string;
}

interface IState {
  department: string;
  requests: IRequest[];
}

export default class SubmissionContainer extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);

    // TODO: remove, this is just for testing.  In reality you will always start with no requests
    const requests: IRequest[] = [
      {
        courseNumber: "LDA12",
        courseType: "LEC",
        requestType: "TA",
        result: 0,
        contest: false,
        contestReason: ""
      }
    ];

    this.state = {
      department: "",
      requests
    };
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
      .then(console.log)
      .catch(console.error);
  };

  private requestUpdated = (i: number, request: IRequest) => {
    console.log("update request", request);

    const requests = this.state.requests;
    requests[i] = request;

    this.setState({ requests });
    // TODO: update the state
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
        courseNumber: "",
        courseType: "LEC",
        requestType: "TA",
        result: 0,
        contest: false,
        contestReason: ""
      }
    ];

    this.setState({ requests });
  };
}
