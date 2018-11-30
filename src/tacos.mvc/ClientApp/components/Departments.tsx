import * as React from "react";
import { IDepartment } from "ClientApp/models/IDepartment";

interface IProps {
  departmentId: number;
  departments: IDepartment[];
  onChange: (departmentId: number) => void;
}

export default class Departments extends React.PureComponent<IProps, {}> {
  public render() {
    const { departmentId, departments } = this.props;

    return (
      <div>
        <label htmlFor="department">Your Department:</label>
        <select
          className="form-control"
          id="department"
          value={departmentId}
          onChange={this.onChange}
        >
          {departments.map(d => 
            <option key={d.id} value={d.id}>{d.name}</option>
          )}
        </select>
      </div>
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    this.props.onChange(value);
  }
}
