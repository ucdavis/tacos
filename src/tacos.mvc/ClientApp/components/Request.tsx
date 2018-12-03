import * as React from "react";

import CourseNumber from "./CourseNumber";
import CourseType from "./CourseType";
import Exception from "./Exception";
import ExceptionDetail from './ExceptionDetail';
import RequestType from "./RequestType";

import { ICourse } from "../models/ICourse";
import { IRequest } from "../models/IRequest";

interface IProps {
  request: IRequest;
  index: number;
  onEdit: (i: number, request: IRequest) => void;
  onRemove: (i: number) => void;
}

export default class Request extends React.Component<IProps, {}> {
  public render() {

    const { request } = this.props;

    return (
      <tbody>
        <tr key={`request-${this.props.index}`}>
          <td>
            <CourseNumber
              course={request.course}
              onChange={this.onCourseChange}
            />
          </td>
          <td>
            <CourseType
              courseType={request.courseType}
              onChange={courseType =>
                this.requestChanged("courseType", courseType)
              }
            />
          </td>
          <td>
            <RequestType
              requestType={request.requestType}
              onChange={requestType =>
                this.requestChanged("requestType", requestType)
              }
            />
          </td>
          <td>{request.calculatedTotal && request.calculatedTotal.toFixed(3)}</td>
          <td>{request.annualizedTotal && request.annualizedTotal.toFixed(3)}</td>
          <td>
            <Exception
              exception={request.exception}
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
          <td>
              { request.isDirty &&
                <i className="far fa-edit fa-xs" title="This class has pending edits."></i>
             }
          </td>
        </tr>
        {this.props.request.exception &&
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
        </tr>}
      </tbody>
    );
  }

  private onCourseChange = (course: ICourse) => {
    this.requestChanged("courseNumber", course.number);
    this.requestChanged("course", course)
  }

  private requestChanged = (prop: string, val: any) => {
    const request = { ...this.props.request, [prop]: val };

    // new request passed up
    this.props.onEdit(this.props.index, request);
  };
}
