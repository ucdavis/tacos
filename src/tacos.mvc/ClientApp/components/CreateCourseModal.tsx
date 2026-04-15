import * as React from "react";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";

import { ICourse } from "../models/ICourse";

interface IProps {
    isOpen: boolean;
    onClose: () => void;

    course: ICourse | undefined;
    onCourseCreate: (course: ICourse) => void;
}

interface IState {
    courseNumber: string;
    courseName: string;
}

// render a textbox for inputing course number, or show course info if already selected
export default class CreateCourseModal extends React.PureComponent<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            courseNumber: "",
            courseName: "",
        };
    }

    public componentDidUpdate(prevProps: IProps) {
        // map state from provided course
        if (prevProps.course !== this.props.course) {
            this.setState({
                courseNumber: this.props.course ? this.props.course.number : "",
                courseName: this.props.course ? this.props.course.name : "",
            });
        }
    }

    public render() {

        const { isOpen, onClose } = this.props;
        const { courseNumber, courseName } = this.state;

        return (
            <Modal isOpen={isOpen} onClose={onClose} centered={true}>
                <ModalHeader>Create Course</ModalHeader>
                <ModalBody>
                    <div className="tacos-form-field">
                        <label className="tacos-form-label" htmlFor="create-course-number">Course Number</label>
                        <input
                            className="tacos-input"
                            id="create-course-number"
                            value={courseNumber}
                            onChange={this.onChangeNumber}
                        />
                    </div>
                    <div className="tacos-form-field">
                        <label className="tacos-form-label" htmlFor="create-course-name">Course Name</label>
                        <input
                            className="tacos-input"
                            id="create-course-name"
                            value={courseName}
                            onChange={this.onChangeName}
                        />
                    </div>
                </ModalBody>
                <ModalFooter className="tacos-modal-footer--split">
                    <button type="button" className="tacos-btn tacos-btn--secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="tacos-btn tacos-btn--primary" onClick={this.onSubmit}>Submit</button>
                </ModalFooter>
            </Modal>
        );
    }

    private onChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            courseNumber: e.target.value,
        });
    }

    private onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            courseName: e.target.value,
        });
    }

    private onSubmit = () => {
        this.props.onCourseCreate({
            number: this.state.courseNumber,
            name: this.state.courseName,
            averageEnrollment: 0,
            averageSectionsPerCourse: 0,
            timesOfferedPerYear: 0,
            crossListingsString: "",
            isCrossListed: false,
            isOfferedWithinPastTwoYears: true,
            isCourseTaughtOnceEveryTwoYears: false,
            wasCourseTaughtInMostRecentYear: false,
            isNew: true,
        });
    }
}
