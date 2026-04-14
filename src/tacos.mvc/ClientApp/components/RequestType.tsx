import * as React from "react";

interface IProps {
    requestType: string;
    onChange: (requestType: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class RequestType extends React.PureComponent<IProps, {}> {
    public render() {
        return (
            <select
                className="tacos-select"
                value={this.props.requestType}
                onChange={this.onChange}
            >
                <option value="TA">TA</option>
                <option value="READ">Reader</option>
            </select>
        );
    }

    private onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.target.value);
    };
}
