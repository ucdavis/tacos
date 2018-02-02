import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  request: IRequest;
  index: number;
  onEdit: (i: number, request: IRequest) => void;
}

export default class Request extends React.Component<IProps, {}> {
  public render() {
    return (
      <tr key={this.props.request.courseNumber}>
        <td>{this.props.request.courseNumber}</td>
        <td>{this.props.request.courseNumber}</td>
        <td>{this.props.request.courseNumber}</td>
        <td>0</td>
        <td>false</td>
      </tr>
    );
  }

  private requestChanged = () => {
      // new request passed up
      this.props.onEdit(this.props.index, this.props.request);
  }
}
