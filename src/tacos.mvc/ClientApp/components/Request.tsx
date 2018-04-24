import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

import Contest from "./Contest";
import ContestDetail from './ContestDetail';
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
          <td>{this.props.request.calculatedTotal}</td>
          <td>Annual</td>
          <td>
            <Contest
              contested={this.props.request.contested}
              onContestedChange={contested =>
                this.requestChanged("contested", contested)
              }
            />
          </td>
          <td>
            <button className="btn btn-danger" onClick={() => this.props.onRemove(this.props.index)}>
              <i className="fa fa-trash-alt" />
            </button>
          </td>
        </tr>
        <tr key={`contest-${this.props.index}`}>
          <td colSpan={5}>
            <ContestDetail
              contested={this.props.request.contested}
              contestReason={this.props.request.contestReason}
              contestTotal={this.props.request.contestTotal}
              onContestTotalChange={contestTotal =>
                this.requestChanged("contestTotal", contestTotal)
              }
              onReasonChange={reason =>
                this.requestChanged("contestReason", reason)
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
