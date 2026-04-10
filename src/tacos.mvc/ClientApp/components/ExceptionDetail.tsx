import * as React from "react";
import NumberInput from "./NumberInput";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "./Modal";

interface IProps {
    requestId: number;
    onRevoke: (id: number) => void | Promise<void>;
    exception: boolean;
    exceptionApproved?: boolean;
    exceptionReason: string;
    exceptionTotal: number;
    exceptionAnnualCount: number;
    onExceptionAnnualCountChange: (exceptionAnnualCount: number) => void;
    onExceptionTotalChange: (exceptionTotal: number) => void;
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
            revoked: false,
            isRevoking: false,
        };
    }

    public componentDidMount() {
        this.isMountedFlag = true;
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
            <div className="exceptionRow mb-4">
                <p>
                    <b>Proposed TA % per course offering</b>
                </p>
                <div className="exceptionRowComponents">{this.renderExceptionTotal()}</div>
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
            <div className="exceptionRow mb-4 d-flex ">
                <p>
                    <b>
                        Your exception request for {this.props.exceptionTotal} TA% per course has
                        been approved for the above course (see review page for approved totals).
                    </b>
                    <button
                        type="button"
                        className="btn btn-link revokeLink ml-2 p-0 align-baseline"
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
                        <ModalBody className="d-flex justify-content-center taco-animation-container">
                            Clicking the revoke approval button will reset this approved exception
                            to un-submitted status. If you have unsaved changes on this page, please
                            cancel and save them before proceeding.
                        </ModalBody>
                        <ModalFooter>
                            {this.renderRevokeButton()}
                            <button
                                type="button"
                                className="btn btn-secondary"
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
                <button type="button" className="btn btn-secondary" disabled={true}>
                    <i className=" mr-3 fas fa-spinner fa-pulse fa-lg" />
                    Revoking...
                </button>
            );
        } else {
            return (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onRevokeClick}
                >
                    Revoke Approval
                </button>
            );
        }
    };

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
    };

    private renderExceptionAnnualCount = () => {
        return (
            <NumberInput
                className="form-control"
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
                className="form-control"
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
