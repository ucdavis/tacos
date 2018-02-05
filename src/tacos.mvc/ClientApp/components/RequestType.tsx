import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  requestType: string;
  onChange: (requestType: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class RequestType extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <select
          className="custom-select"
          value={this.props.requestType}
          onChange={e => this.props.onChange(e.currentTarget.value)}
        >
          <option value="TA">TA</option>
          <option value="READ">Reader</option>
        </select>
      </div>
    );
  }
}
