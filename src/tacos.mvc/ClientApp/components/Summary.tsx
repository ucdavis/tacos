import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  onSubmit : () => void;
  onReset : () => void;
  canSubmit: boolean;
  total: number;
}

// the overall summary of totals, plus action/submit button
export default class Summary extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div className="navbar navbar-default navbar-expand-xs fixed-bottom" role="navigation">
        <div className="navbar-banner">
          <div className="container-fluid d-flex justify-content-between">
            <a className="navbar-brand navbar-brand mr-auto" href="#">Request Total: {this.props.total > 0 ? this.props.total.toFixed(3) : '---'}</a>
            <div>
              <button className="btn btn-danger" onClick={this.props.onReset}>Reset</button>
              <button className="btn btn-primary" id="submit-button" disabled={!this.props.canSubmit} onClick={this.props.onSubmit}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
