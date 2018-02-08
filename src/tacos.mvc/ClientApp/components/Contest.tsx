import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  contested: boolean;
  contestReason: string;
  contestTotal: number;
  onContestedChange: (contest: boolean) => void;
  onContestTotalChange: (contestTotal: number) => void;
  onReasonChange: (contestReason: string) => void;
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
            Contest
          </label>
        </div>
        <div>{this.renderContestTotal()}</div>
        <div>{this.renderContestReason()}</div>
      </div>
    );
  }

  private renderContestTotal = () => {
    if (this.props.contested) {
      return (
        <input className="form-control" type="number" min={0} step={0.25} placeholder="Total FTE requested" value={this.props.contestTotal} onChange={e => this.props.onContestTotalChange(e.target.valueAsNumber)} />
      );
    }
  }

  private renderContestReason = () => {
    if (this.props.contested) {
      // only show if we are contesting
      return (
        <textarea
          className="form-control"
          placeholder="Reason for contesting the course request"
          rows={3}
          value={this.props.contestReason}
          onChange={e => this.props.onReasonChange(e.target.value)}
        />
      );
    }
  };
}
