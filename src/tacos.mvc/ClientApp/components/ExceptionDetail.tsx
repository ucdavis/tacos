import * as React from "react";

import NumberInput from "./NumberInput";

interface IProps {
    exception: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    onExceptionTotalChange: (exceptionTotal: number) => void;
    onReasonChange: (exceptionReason: string) => void;
}

// render a textbox for inputing course number, or show course info if already selected
export default class ExceptionDetail extends React.PureComponent<IProps, {}> {
    public render() {
        if (!this.props.exception) { return null; }

        return (
            <div className="exceptionRow">
                <p>
                    <b>Proposed number of TAs per course</b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionTotal()}</div>
                <p>
                    <b>
                        Reason for requesting an exception. Requests for additional TA or Reader
                        support for courses with unusually special circumstances will be considered.
                    </b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionReason()}</div>
            </div>
        );
    }

    private renderExceptionTotal = () => {
        return (
            <NumberInput
                className="form-control"
                min={0}
                step={0.25}
                placeholder="Total FTE requested"
                value={this.props.exceptionTotal}
                onChange={this.onChangeTotal}
                format={this.formatExceptionTotal}
            />
        );
    }

    private formatExceptionTotal = (value: number) => {
        if (value === 0) {
            return "";
        }

        return value.toFixed(2);
    }

    private renderExceptionReason = () => {
        return (
            <textarea
                className="form-control"
                placeholder="Reason for exceptioning the course request"
                rows={3}
                value={this.props.exceptionReason}
                onChange={this.onChangeReason}
            />
        );
    };

    private onChangeTotal = (value: number) => {
        this.props.onExceptionTotalChange(value);
    };

    private onChangeReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.props.onReasonChange(e.target.value);
    };
}
