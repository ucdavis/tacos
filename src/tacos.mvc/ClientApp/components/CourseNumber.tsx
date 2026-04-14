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
    syncedCourseNumber: string | undefined;

    querying: boolean;
    notFound: boolean;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CourseNumber extends React.Component<IProps, IState> {

    public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        const nextState: Partial<IState> = {};
        const nextCourseNumber = nextProps.course ? nextProps.course.number : undefined;
        
        if (nextProps.course) {
            nextState.notFound = false;
        }

        if (nextCourseNumber !== prevState.syncedCourseNumber) {
            nextState.syncedCourseNumber = nextCourseNumber;

            if (nextCourseNumber !== undefined) {
                nextState.courseNumber = nextCourseNumber;
            }
        }

        return nextState;
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            courseNumber: props.course ? props.course.number : "",
            syncedCourseNumber: props.course ? props.course.number : undefined,
            querying: false,
            notFound: false,
        };
    }

    public render() {
        const { course } = this.props;
        const { courseNumber, notFound } = this.state;

        const courseName = course ? course.name : "";

        const isValid = !!course;
        const isNew = course && course.isNew;

        return (
            <div>
                <div className="tacos-input-group">
                    <input
                        data-course-number-input="true"
                        type="text"
                        className="tacos-input"
                        value={courseNumber}
                        onChange={this.onCourseNumberChange}
                    />
                    <div className="tacos-input-group__addon">
                        <span
                            className="tacos-input-group__status"
                            id="basic-addon2"
                            style={{ color: isValid ? "green" : "red" }}
                        >
                            {this.renderIndicator()}
                        </span>
                    </div>
                </div>
                { notFound && (
                    <small className="tacos-form-help">
                        <span className="tacos-form-help__message">Course Not Found!</span>
                        <button className="tacos-link-button" type="button" onClick={this.onCourseCreate}>
                            Add new course?
                        </button>
                    </small>
                )}
                { isValid && (
                    <small className="tacos-form-help tacos-form-help--muted">
                        <span className="tacos-truncate" title={courseName}>{ courseName }</span>
                    </small>
                )}
            </div>
        );
    }

    private renderIndicator = () => {
        const { course } = this.props;
        const { querying } = this.state;

        if (querying) {
            return <i className="fas fa-fw fa-spin fa-spinner" />;
        }

        const isValid = !!course;
        const isNew = course && course.isNew;

        if (isValid && isNew) {
            return (
                <button className="tacos-link-button tacos-link-button--icon" type="button" onClick={this.onCourseCreate}>
                    <i className="far fa-fw fa-edit" />
                </button>
            );
        }

        return <i className={`fas fa-fw fa-${isValid ? "check" : "times"}`} />;
    };

    

    private onCourseNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const courseNumber = event.target.value;
            this.setState({
                courseNumber,       // save controlled input
                notFound: false,    // remove "add new course" message
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
            crossListingsString: "",
            isCrossListed: false,
            isOfferedWithinPastTwoYears: true,
            isCourseTaughtOnceEveryTwoYears: false,
            wasCourseTaughtInMostRecentYear: false,
            isNew: true,
        })
    }
}
