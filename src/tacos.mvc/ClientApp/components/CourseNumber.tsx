import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  courseNumber: string;
  onChange: (courseNumber: string) => void;
}

interface IState {
  valid: boolean;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CourseNumber extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      valid: this.isValid(props.courseNumber)
    };
  }
  public render() {
    return (
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={this.props.courseNumber}
          onChange={this.onNumberChanged}
        />
        <div className="input-group-append">
          <span className="input-group-text" id="basic-addon2">
            <i className={`fa fa-${this.state.valid ? "check" : "times"}`} />
          </span>
        </div>
      </div>
    );
  }

  private isValid = (courseNumber: string) => {
    return courseNumber.length >= 4;
  };

  private onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: check to see if it is valid via ajax

    const val = event.target.value;

    // TODO: testing, right now it'll just need to be 4+ chars long
    this.setState({ valid: this.isValid(val) });

    this.props.onChange(val);
  };
}
