import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  exception: boolean;
  onExceptionedChange: (exception: boolean) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Exception extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={this.props.exception}
            onChange={e => this.props.onExceptionedChange(e.target.checked)}
            id="defaultCheck1"
          />
          <label className="form-check-label" htmlFor="defaultCheck1">
            Exception
          </label>
        </div>
      </div>
    );
  }
}
