import * as React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

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

    public componentWillReceiveProps(nextProps: IProps) {
        // map state from provided course
        if (this.props.course !== nextProps.course) {
            this.setState({
                courseNumber: nextProps.course ? nextProps.course.number : "",
                courseName: nextProps.course ? nextProps.course.name : "",
            });
        }
    }

    public render() {

        const { isOpen, onClose } = this.props;
        const { courseNumber, courseName } = this.state;

        return (
            <Modal isOpen={isOpen} onClosed={onClose} centered={true}>
                <ModalHeader>Create Course</ModalHeader>
                <ModalBody>
                    <div className="form-group">
                        <label>Course Number</label>
                        <input className="form-control" value={courseNumber} onChange={this.onChangeNumber} />
                    </div>
                    <div className="form-group">
                        <label>Course Name</label>
                        <input className="form-control" value={courseName} onChange={this.onChangeName} />
                    </div>
                </ModalBody>
                <ModalFooter className="d-flex justify-content-between">
                    <button className="btn btn-secondary">Cancel</button>
                    <button className="btn btn-primary" onClick={this.onSubmit}>Submit</button>
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

            isNew: true,
        });
    }
}
