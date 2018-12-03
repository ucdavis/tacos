import * as React from "react";
import { IDepartment } from "ClientApp/models/IDepartment";

interface IProps {
  value: IDepartment | undefined;
  departments: IDepartment[];
  onChange: (department: IDepartment | undefined) => void;
}

export default class Departments extends React.PureComponent<IProps, {}> {
  public render() {
    const { value, departments } = this.props;

    const departmentId = value && value.id;

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
      const { departments } = this.props;

      const id = parseInt(e.target.value, 10);
      const department = departments.find(d => d.id == id);
    this.props.onChange(department);
  }
}
