import * as React from "react";
import * as ReactDOM from "react-dom";
import { IRequest } from "./SubmissionContainer";

interface IProps {
  courseType: string;
  onChange: (courseType: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CourseType extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <select
          className="custom-select"
          value={this.props.courseType}
          onChange={e => this.props.onChange(e.currentTarget.value)}
        >
          <option value="STD">Standard</option>
          <option value="LEC">Lecture</option>
          <option value="LAB">Lab</option>
        </select>
      </div>
    );
  }
}
