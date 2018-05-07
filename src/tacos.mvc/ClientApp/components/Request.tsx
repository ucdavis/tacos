import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

import Exception from "./Exception";
import ExceptionDetail from './ExceptionDetail';
import CourseNumber from "./CourseNumber";
import CourseType from "./CourseType";
import RequestType from "./RequestType";

interface IProps {
  request: IRequest;
  index: number;
  onEdit: (i: number, request: IRequest) => void;
  onRemove: (i: number) => void;
}

export default class Request extends React.Component<IProps, {}> {
  public render() {
    return (
      <tbody>
        <tr key={`request-${this.props.index}`}>
          <td>
            <CourseNumber
              course={this.props.request.course}
              onChange={course => this.requestChanged("course", course)}
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
          <td>{this.props.request.calculatedTotal.toFixed(3)}</td>
          <td>{this.props.request.annualizedTotal.toFixed(3)}</td>
          <td>
            <Exception
              exception={this.props.request.exception}
              onExceptionChange={exception =>
                this.requestChanged("exception", exception)
              }
            />
          </td>
          <td>
            <button className="btn btn-danger" onClick={() => this.props.onRemove(this.props.index)}>
              <i className="fa fa-trash-alt" />
            </button>
          </td>
        </tr>
        <tr key={`exception-${this.props.index}`}>
          <td colSpan={7}>
            <ExceptionDetail
              exception={this.props.request.exception}
              exceptionReason={this.props.request.exceptionReason}
              exceptionTotal={this.props.request.exceptionTotal}
              onExceptionTotalChange={exceptionTotal =>
                this.requestChanged("exceptionTotal", exceptionTotal)
              }
              onReasonChange={reason =>
                this.requestChanged("exceptionReason", reason)
              }
            />
          </td>
        </tr>
      </tbody>
    );
  }

  private requestChanged = (prop: string, val: any) => {
    const request = { ...this.props.request, [prop]: val };

    // new request passed up
    this.props.onEdit(this.props.index, request);
  };
}
