import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  contested: boolean;
  onContestedChange: (contest: boolean) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Contest extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={this.props.contested}
            onChange={e => this.props.onContestedChange(e.target.checked)}
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
