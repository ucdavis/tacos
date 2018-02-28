import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  onSubmit : () => void;
  onReset : () => void;
  canSubmit: boolean;
}

// the overall summary of totals, plus action/submit button
export default class Summary extends React.PureComponent<IProps, {}> {
  public render() {
    return (

      <div className="head-bleed">
      <div className="head_divider">
      <nav
        className="navbar fixed-bottom bg-blue"
      >
        <span className="navbar-brand">Request Total: XYZ</span>
        <div className="pull-right">
          <button className="btn btn-danger" onClick={this.props.onReset}>
            Reset
          </button>
          <button className="btn btn-primary" disabled={!this.props.canSubmit} onClick={this.props.onSubmit}>
            Submit
          </button>
        </div>
      </nav>
      </div>
      </div>
    );
  }
}
