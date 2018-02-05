import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

import CourseNumber from "./CourseNumber";
import CourseType from "./CourseType";
import RequestType from "./RequestType";

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
          <CourseType
            courseType={this.props.request.courseType}
            onChange={courseType =>
              this.requestChanged("courseType", courseType)
            }
          />
        </td>
        <td>
          <RequestType
            requestType={this.props.request.requestType}
            onChange={requestType =>
              this.requestChanged("requestType", requestType)
            }
          />
        </td>
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
