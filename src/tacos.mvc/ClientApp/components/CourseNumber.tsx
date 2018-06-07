import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest, ICourse } from "./SubmissionContainer";

interface IProps {
  course: ICourse;
  onChange: (course: ICourse) => void;
}

interface IState {
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
      querying: false
    };
  }
  public render() {
    let courseName = this.props.course.name;
    return (
      <div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={this.props.course.number}
            onChange={this.onNumberChanged}
          />
          <div className="input-group-append">
            <span
              className="input-group-text"
              id="basic-addon2"
              style={{ color: this.props.course.valid ? "green" : "red" }}
            >
              {this.renderIndicator()}
            </span>
          </div>
        </div>
        {!!courseName && <small className="form-text text-muted">{courseName}</small>}
      </div>
    );
  }

  private renderIndicator = () => {
    if (this.state.querying) {
      return <i className="fa fa-spin fa-spinner" />;
    } else {
      return <i className={`fa fa-${this.props.course.valid ? "check" : "times"}`} />;
    }
  };

  private onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    this.props.onChange({ ...defaultCourse, number: val });

    // only valid if we are at 6+ chars
    if (val.length < 6) {
      this.setState({ querying: false });
      return;
    }

    this.setState({ querying: true });

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
        if (course) {
          this.setState({ querying: false });
          this.props.onChange({ ...course, valid: true });
        }
      })
      .catch(err => {
        console.error(err);

        this.setState({ querying: false });
      });
  };
}
