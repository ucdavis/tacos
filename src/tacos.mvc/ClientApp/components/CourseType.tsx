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
                    {CourseTypeOptions.map(c => (
                        <option key={c[0]} value={c[0]}>{c[1]}</option>
                    ))}
                </select>
            </div>
        );
    }

    private onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
    };
}

export const CourseTypeOptions = [
    [ "STD", "Standard lecture with sections" ],
    [ "WRT", "Writing intensive lecture with sections" ],
    [ "LAB", "Lab or Studio classes" ],
    [ "FLD", "Field classes" ],
    [ "AUTO", "Lecture only, automated grading" ],
    [ "MAN", "Lecture only, manual grading" ],
    [ "MODW", "Lecture only, moderate writing" ],
    [ "INT", "Lecture only, writing intensive or substantial project" ]
];
