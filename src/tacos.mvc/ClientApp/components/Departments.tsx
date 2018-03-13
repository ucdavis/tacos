import * as React from "react";
import * as ReactDOM from "react-dom";

interface IProps {
  department: string;
  onChange: (department: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Departments extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <div>
        <label htmlFor="department">Your Department:</label>
        <select
          className="form-control"
          id="department"
          value={this.props.department}
          onChange={e => this.props.onChange(e.target.value)}
        >
          <option value="AANS">Animal Science</option>
          <option value="APLS">Plant Sciences</option>
          <option value="LAWR">Land, Air, Water</option>
        </select>
      </div>
    );
  }
}
