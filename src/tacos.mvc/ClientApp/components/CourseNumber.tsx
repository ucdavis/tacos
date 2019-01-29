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

        const courseName = course.name;
        const isValid = !!course.name;

        return (
            <div>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={course.number}
                        onChange={this.onCourseNumberChange}
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
                {isValid && <small className="form-text text-muted pl-2">{courseName}</small>}
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

    private onCourseNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const courseNumber = event.target.value;
            this.setState({
                courseNumber,
            });

            // changing the number clears the assigned course object
            this.props.onChange(undefined);

            // only trigger search when length > 6
            if (courseNumber.length < 6) {
                this.setState({
                    querying: false,
                });
                return;
            }

            this.searchCourse(courseNumber)
    }

    // tslint:disable-next-line:member-ordering
    private searchCourse = debounce(async (courseNumber: string) => {
        try {
            this.setState({ querying: true });

            const response = await fetch(`/course/${courseNumber}`, {
                headers: [["Accept", "application/json"], ["Content-Type", "application/json"]],
                method: "GET",
                credentials: "include"
            });

            // handle explictly
            if (response.status === 404) {
                this.setState({
                    notFound: true,
                });
                return;
            }

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const result: ICourse = await response.json();

            // pass up found course
            this.props.onChange({
                ...result,
                isNew: false,
            });

            this.setState({
                notFound: false,
            });
        }
        catch (err) {
            LogService.error(err);
            this.setState({ querying: false });
        }
        finally {
            this.setState({ querying: false });
        }
    }, 100);
    }
}
