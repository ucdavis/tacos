import * as React from "react";

interface IProps {
    exception: boolean;
    onExceptionChange: (exception: boolean) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Exception extends React.PureComponent<IProps, {}> {
    public render() {
        return (
            <div className="pretty p-switch p-fill">
                <input type="checkbox" checked={this.props.exception} onChange={this.onChange} />
                <div className="state p-primary">
                    <label></label>
                </div>
            </div>
        );
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onExceptionChange(e.target.checked);
    };
}
