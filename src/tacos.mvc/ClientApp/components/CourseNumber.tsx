import * as React from "react";
import * as LogService from "../services/LogService";

import { ICourse } from "../models/ICourse";

interface IProps {
    course: ICourse;
    onChange: (course: ICourse) => void;
}

interface IState {
  querying: boolean;
}

const defaultCourse: ICourse = {
  name: "",
  number: "",
  timesOfferedPerYear: 0,
  averageEnrollment: 0,
  averageSectionsPerCourse: 0,
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
        const { course } = this.props;

        let courseName = course.name;
        const isValid = !!course.name;

        return (
            <div>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={course.number}
                        onChange={this.onNumberChanged}
                    />
                    <div className="input-group-append">
                        <span
                            className="input-group-text"
                            id="basic-addon2"
                            style={{ color: isValid ? "green" : "red" }}
                        >
                            {this.renderIndicator()}
                        </span>
                    </div>
                </div>
                {isValid && <small className="form-text text-muted">{courseName}</small>}
            </div>
        );
    }

    private renderIndicator = () => {
        const { course } = this.props;
        const { querying } = this.state;

        if (querying) {
            return <i className="fa fa-spin fa-spinner" />;
        }

        const isValid = !!course.name;

        return <i className={`fa fa-${isValid ? "check" : "times"}`} />;
    };

    private onNumberChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {

            const val = event.target.value;
            this.props.onChange({ ...defaultCourse, number: val });

            // only valid if we are at 6+ chars
            if (val.length < 6) {
                this.setState({ querying: false });
                return;
            }

            this.setState({ querying: true });

            // TODO: debounce

            const response = await fetch(`/course/${val}`, {
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "GET",
                credentials: "include"
            })

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const course: ICourse = await response.json();

            if (course) {
                this.setState({ querying: false });
                this.props.onChange(course);
            }
        }
        catch (err) {

            LogService.error(err);
            this.setState({ querying: false });
        }
    }
}
