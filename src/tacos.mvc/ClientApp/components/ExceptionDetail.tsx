import * as React from "react";

import NumberInput from "./NumberInput";

interface IProps {
    exception: boolean;
    exceptionApproved?: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    onExceptionTotalChange: (exceptionTotal: number) => void;
    onReasonChange: (exceptionReason: string) => void;
}

interface IState {
    exceptionReason: string;
}

// render a textbox for inputing course number, or show course info if already selected
export default class ExceptionDetail extends React.PureComponent<IProps, IState> {

    public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        if (nextProps.exceptionReason !== prevState.exceptionReason) {
            return {
                exceptionReason: nextProps.exceptionReason,
            };
        }

        return null;
    }

    constructor(props: IProps) {
        super(props); 

        this.state = {
            exceptionReason: "",
        };
    }

    public render() {
        if (!this.props.exception) { return null; }

        if (this.props.exceptionApproved) {
            return this.renderApprovedException();
        }

        return (
            <div className="exceptionRow">
                <p>
                    <b>Proposed TA % per course offering</b>
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

    private renderApprovedException = () => {
        if (!this.props.exceptionApproved) { return null; }

        return (<p>Approved!</p>);
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
        const { exceptionReason } = this.state;
        return (
            <textarea
                className="form-control"
                placeholder="Reason for exceptioning the course request"
                rows={3}
                value={exceptionReason}
                onBlur={this.onBlurReason}
                onChange={this.onChangeReason}
            />
        );
    };

    private onChangeTotal = (value: number) => {
        this.props.onExceptionTotalChange(value);
    };

    private onBlurReason = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        this.props.onReasonChange(e.target.value);
    };
    
    private onChangeReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            exceptionReason: e.target.value,
        });
    };
}
