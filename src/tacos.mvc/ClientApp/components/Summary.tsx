import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {}

// the overall summary of totals, plus action/submit button
export default class Summary extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <nav
        className="navbar fixed-bottom bg-blue"
        style={{ backgroundColor: "#228ae6" }}
      >
        <span className="navbar-brand">Request Total: XYZ</span>
        <div className="pull-right">
          <button className="btn btn-primary" disabled>
            Submit
          </button>
        </div>
      </nav>
    );
  }
}
