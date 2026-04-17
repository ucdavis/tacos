import * as React from "react";
import NumberInput from "./NumberInput";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";

interface IProps {
    requestId: number;
    onRevoke: (id: number) => void | Promise<void>;
    exception: boolean;
    exceptionApproved?: boolean;
    exceptionReason: string;
    exceptionTaTotal: number;
    exceptionReaderTotal: number;
    exceptionAnnualCount: number;
    onExceptionAnnualCountChange: (exceptionAnnualCount: number) => void;
    onExceptionTaTotalChange: (exceptionTotal: number) => void;
    onExceptionReaderTotalChange: (exceptionTotal: number) => void;
    onReasonChange: (exceptionReason: string) => void;
}

interface IState {
    exceptionReason: string;
    revoked: boolean;
    isRevoking: boolean;
}

// render a textbox for inputing course number, or show course info if already selected
export default class ExceptionDetail extends React.PureComponent<IProps, IState> {
    private isMountedFlag = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            exceptionReason: props.exceptionReason,
            revoked: false,
            isRevoking: false,
        };
    }

    public componentDidMount() {
        this.isMountedFlag = true;
    }

    public componentDidUpdate(prevProps: IProps) {
        if (
            prevProps.exceptionReason !== this.props.exceptionReason
            && this.props.exceptionReason !== this.state.exceptionReason
        ) {
            this.setState({
                exceptionReason: this.props.exceptionReason,
            });
        }
    }

    public componentWillUnmount() {
        this.isMountedFlag = false;
    }

    public render() {
        if (!this.props.exception) {
            return null;
        }

        if (this.props.exceptionApproved) {
            return this.renderApprovedException();
        }

        return (
            <div className="exceptionRow">
                <p>
                    <b>Proposed TA % per course offering</b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionTaTotal()}</div>
                <p>
                    <b>Proposed Reader % per course offering</b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionReaderTotal()}</div>
                <p>
                    <b>Proposed number of annual course offerings</b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionAnnualCount()}</div>
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
        if (!this.props.exceptionApproved) {
            return null;
        }

        return (
            <div className="exceptionRow exceptionRow--approved">
                <p>
                    <b>
                        Your approved exception request is TA {this.props.exceptionTaTotal.toFixed(2)}
                        {" and "}Reader {this.props.exceptionReaderTotal.toFixed(2)} per course
                        and has
                        been approved for the above course (see review page for approved totals).
                    </b>
                    <button
                        type="button"
                        className="tacos-link-button revokeLink exceptionRow__revoke"
                        id="revoke-button"
                        onClick={this.revokedToggle}
                    >
                        Revoke Approval
                    </button>
                </p>

                {this.renderRevokedModel()}
            </div>
        );
    };

    private revokedToggle = () => {
        this.setState((prevState) => ({
            revoked: !prevState.revoked,
        }));
    };

    private renderRevokedModel = () => {
        if (this.state.revoked) {
            return (
                <div>
                    <Modal isOpen={true} onClose={this.revokedToggle}>
                        <ModalHeader>Please confirm</ModalHeader>
                        <ModalBody className="taco-animation-container tacos-modal-body-centered">
                            Clicking the revoke approval button will reset this approved exception
                            to un-submitted status. If you have unsaved changes on this page, please
                            cancel and save them before proceeding.
                        </ModalBody>
                        <ModalFooter>
                            {this.renderRevokeButton()}
                            <button
                                type="button"
                                className="tacos-btn tacos-btn--secondary"
                                onClick={this.revokedToggle}
                            >
                                Cancel
                            </button>
                        </ModalFooter>
                    </Modal>
                </div>
            );
        }
    };

    private renderRevokeButton = () => {
        if (this.state.isRevoking) {
            return (
                <button type="button" className="tacos-btn tacos-btn--secondary" disabled={true}>
                    <i className="fas fa-spinner fa-pulse fa-lg tacos-inline-icon-start" />
                    Revoking...
                </button>
            );
        } else {
            return (
                <button
                    type="button"
                    className="tacos-btn tacos-btn--primary"
                    onClick={this.onRevokeClick}
                >
                    Revoke Approval
                </button>
            );
        }
    };

    private renderExceptionTaTotal = () => {
        return (
            <NumberInput
                className="tacos-input"
                min={0}
                step={0.25}
                placeholder="TA FTE requested"
                value={this.props.exceptionTaTotal}
                onChange={this.onChangeTaTotal}
                format={this.formatExceptionTotal}
            />
        );
    };

    private renderExceptionReaderTotal = () => {
        return (
            <NumberInput
                className="tacos-input"
                min={0}
                step={0.25}
                placeholder="Reader FTE requested"
                value={this.props.exceptionReaderTotal}
                onChange={this.onChangeReaderTotal}
                format={this.formatExceptionTotal}
            />
        );
    };

    private renderExceptionAnnualCount = () => {
        return (
            <NumberInput
                className="tacos-input"
                min={0}
                step={0.25}
                placeholder="Annual offerings requested"
                value={this.props.exceptionAnnualCount}
                onChange={this.onChangeAnnualCount}
                format={this.formatExceptionTotal}
            />
        );
    };

    private formatExceptionTotal = (value: number) => {
        if (value === 0) {
            return "";
        }

        return value.toFixed(2);
    };

    private renderExceptionReason = () => {
        const { exceptionReason } = this.state;
        return (
            <textarea
                className="tacos-textarea"
                placeholder="Reason for exceptioning the course request"
                rows={3}
                value={exceptionReason}
                onBlur={this.onBlurReason}
                onChange={this.onChangeReason}
            />
        );
    };

    private onChangeAnnualCount = (value: number) => {
        this.props.onExceptionAnnualCountChange(value);
    };

    private onChangeTaTotal = (value: number) => {
        this.props.onExceptionTaTotalChange(value);
    };

    private onChangeReaderTotal = (value: number) => {
        this.props.onExceptionReaderTotalChange(value);
    };

    private onBlurReason = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        this.props.onReasonChange(e.target.value);
    };

    private onChangeReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            exceptionReason: e.target.value,
        });
    };

    private onRevokeClick = async () => {
        this.setState({ isRevoking: true });

        try {
            await this.props.onRevoke(this.props.requestId);
        } finally {
            if (this.isMountedFlag) {
                this.setState({ isRevoking: false });
            }
        }
    };
}
