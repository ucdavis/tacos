import * as React from "react";
import * as ReactDOM from "react-dom";
import Request from "./Request";

export interface IRequest {
  courseNumber: string;
  courseType: string;
  requestType: string;
  result: number;
  contest: boolean;
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
        courseType: "",
        requestType: "",
        result: 0,
        contest: false
      }
    ];

    this.state = {
      department: "",
      requests
    };
  }
  public render() {
    return <div>{this.renderRequests()}</div>;
  }

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
        courseType: "",
        requestType: "",
        result: 0,
        contest: false
      }
    ];

    this.setState({ requests });
  };
}
