import * as React from "react";

interface IProps {
    exception: boolean;
    onExceptionChange: (exception: boolean) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class Exception extends React.PureComponent<IProps, {}> {
    public render() {
        return (
            <div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={this.props.exception}
                        onChange={this.onChange}
                        id="defaultCheck1"
                    />
                    <label className="form-check-label" htmlFor="defaultCheck1">
                        Exception
                    </label>
                </div>
            </div>
        );
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onExceptionChange(e.target.checked);
    };
}
