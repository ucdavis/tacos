import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  contested: boolean;
  contestReason: string;
  contestTotal: number;
  onContestTotalChange: (contestTotal: number) => void;
  onReasonChange: (contestReason: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class ContestDetail extends React.PureComponent<IProps, {}> {
  public render() {
    if (!this.props.contested) return null;

    return (
      <div className="contestRow">
        <p><b>Proposed number of TAs per course</b></p>
        <div className="contestRowComponents">{this.renderContestTotal()}</div>
        <p><b>Reason for requesting an exception. Requests for additional TA or Reader support for courses with unusually special circumpstances will be considered.</b></p>
        <div className="contestRowComponents">{this.renderContestReason()}</div>
      </div>
    );
  }

  private renderContestTotal = () => {
    return (
      <input
        className="form-control"
        type="number"
        min={0}
        step={0.25}
        placeholder="Total FTE requested"
        value={this.props.contestTotal}
        onChange={e => this.props.onContestTotalChange(e.target.valueAsNumber)}
      />
    );
  };

  private renderContestReason = () => {
    return (
      <textarea
        className="form-control"
        placeholder="Reason for contesting the course request"
        rows={3}
        value={this.props.contestReason}
        onChange={e => this.props.onReasonChange(e.target.value)}
      />
    );
  };
}
