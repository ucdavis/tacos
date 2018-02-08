import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest, ICourse } from "./SubmissionContainer";

interface IProps {
  course: ICourse;
  onChange: (course: ICourse) => void;
}

interface IState {
  valid: boolean;
  querying: boolean;
}

const defaultCourse = {
  name: "",
  number: "",
  timesOfferedPerYear: 0,
  averageEnrollment: 0,
  averageSectionsPerCourse: 0,
  valid: false
};

// render a textbox for inputing course number, or show course info if already selected
export default class CourseNumber extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      valid: props.course.valid,
      querying: false
    };
  }
  public render() {
    return (
      <div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={this.props.course.number}
            onChange={this.onNumberChanged}
          />
          <div className="input-group-append">
            <span className="input-group-text" id="basic-addon2">
              {this.renderIndicator()}
            </span>
          </div>
        </div>
        <small className="form-text text-muted">
          {this.props.course.name}
        </small>
      </div>
    );
  }

  private renderIndicator = () => {
    if (this.state.querying) {
      return <i className="fa fa-spin fa-spinner" />;
    } else {
      return <i className={`fa fa-${this.state.valid ? "check" : "times"}`} />;
    }
  };

  private onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    this.props.onChange({ ...defaultCourse, number: val });

    if (val.length < 4) {
      this.setState({ querying: false, valid: false });
      return; // never valid if we are <4 chars
    }

    this.setState({ querying: true, valid: false });

    // TODO: debounce

    fetch(`/course/${val}`, {
      headers: [
        ["Accept", "application/json"],
        ["Content-Type", "application/json"]
      ],
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }

        return res.json();
      })
      .then((course: ICourse) => {
        this.setState({ querying: false, valid: true });
        this.props.onChange({ ...course, valid: true });
      })
      .catch(err => {
        console.error(err);

        this.setState({ querying: false, valid: false });
      });
  };
}
