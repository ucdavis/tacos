import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

import CourseNumber from "./CourseNumber";

interface IProps {
  request: IRequest;
  index: number;
  onEdit: (i: number, request: IRequest) => void;
}

export default class Request extends React.Component<IProps, {}> {
  public render() {
    return (
      <tr key={`request-${this.props.index}`}>
        <td>
          <CourseNumber
            courseNumber={this.props.request.courseNumber}
            onChange={courseNumber =>
              this.requestChanged("courseNumber", courseNumber)
            }
          />
        </td>
        <td>
          <select
            className="form-control"
            id="exampleFormControlSelect1"
            onChange={() => this.requestChanged("courseType", "3")}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </td>
        <td>{this.props.request.courseNumber}</td>
        <td>0</td>
        <td>false</td>
      </tr>
    );
  }

  private requestChanged = (prop: string, val: string) => {
    const request = { ...this.props.request, [prop]: val };

    // new request passed up
    this.props.onEdit(this.props.index, request);
  };
}
