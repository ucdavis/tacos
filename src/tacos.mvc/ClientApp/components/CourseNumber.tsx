import * as React from "react";
import * as LogService from "../services/LogService";

import debounce from "../util/debounce";

import { ICourse } from "../models/ICourse";

interface IProps {
    course: ICourse | undefined;
    onChange: (course: ICourse | undefined) => void;

    onCourseCreate: (defaultValues: ICourse) => void;
}

interface IState {
    courseNumber: string;

    querying: boolean;
    notFound: boolean;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CourseNumber extends React.Component<IProps, IState> {

    public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        const nextState: Partial<IState> = {};
        
        if (nextProps.course) {
            nextState.notFound = false;
        }

        if (nextProps.course && prevState.courseNumber !== nextProps.course.number) {
            nextState.courseNumber = nextProps.course.number;
        }

        return nextState;
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            courseNumber: props.course ? props.course.number : "",
            querying: false,
            notFound: false,
        };
    }

    public render() {
        const { course } = this.props;
        const { courseNumber, notFound } = this.state;

        const courseName = course ? course.name : "";

        const isValid = !!course;
        const isNew = course && course.isNew

        return (
            <div>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={courseNumber}
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
                { notFound && (
                    <small className="form-text pl-2">
                        <span className="mr-3">Course Not Found!</span>
                        <button className="btn-link p-0 border-0" style={{ cursor: "pointer" }} onClick={this.onCourseCreate}>
                            Add new course?
                        </button>
                    </small>
                )}
                { isValid && (
                    <small className="form-text text-muted pl-2">
                        <span>{ courseName } </span>
                        { isNew && (
                            <button className="btn-link p-0 border-0" style={{ cursor: "pointer" }} onClick={this.onCourseCreate}>
                                Edit new course details?
                            </button>
                        )}
                    </small>
                )}
            </div>
        );
    }

    private renderIndicator = () => {
        const { course } = this.props;
        const { querying } = this.state;

        if (querying) {
            return <i className="fa fa-spin fa-spinner" />;
        }

        const isValid = !!course;

        return <i className={`fa fa-${isValid ? "check" : "times"}`} />;
    };

    private onCourseNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const courseNumber = event.target.value;
            this.setState({
                courseNumber,
            });

            // clear out course when changing this value
            this.onCourseClear();

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
    private onCourseClear = debounce(() => {
        this.props.onChange(undefined);
    }, 100);

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
    }, 250);
    
    private onCourseCreate = () => {
        const { courseNumber } = this.state;
        this.props.onCourseCreate({
            name: "",
            number: courseNumber,
            averageEnrollment: 0,
            averageSectionsPerCourse: 0,
            timesOfferedPerYear: 0,
            isNew: true,
        })
    }
}
