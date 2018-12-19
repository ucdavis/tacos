import * as React from "react";

interface IProps {
  courseType: string;
  onChange: (courseType: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CourseType extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div className="input-group">
                <select
                    className="custom-select"
                    value={this.props.courseType}
                    onChange={this.onChange}
                >
                    <option value="STD">Standard lecture</option>
                    <option value="WRT">Writing intensive lecture</option>
          <option value="LAB">Lab or Studio classes</option>
          <option value="FLD">Field classes</option>
          <option value="AUTO">Lecture only, automated grading</option>
          <option value="MAN">Lecture only, manual grading</option>
          <option value="MODW">Lecture only, moderate writing</option>
          <option value="INT">Lecture only, writing intensive or substantial project</option>
        </select>
      </div>
    );
  }

    private onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
    };
}
