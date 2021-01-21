import * as React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, NavLink } from "reactstrap";
import NumberInput from "./NumberInput";

interface IProps {
    requestId: number;
    onRevoke: (id: number) => void;
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
                    <a className=" revokeLink ml-2" id="revoke-button" onClick={this.revokedToggle}>
                        Revoke Approval
                    </a>
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
                    <Modal isOpen={true}>
                        <ModalHeader>Please confirm</ModalHeader>
                        <ModalBody className="d-flex justify-content-center taco-animation-container">
                            Clicking the revoke approval button will reset this approved exception
                            to un-submitted status. If you have unsaved changes on this page, please
                            cancel and save them before proceeding.
                        </ModalBody>
                        <ModalFooter>
                            {this.renderRevokeButton()}
                            <Button onClick={this.revokedToggle}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            );
        }
    };

    private renderRevokeButton = () => {
        if (this.state.isRevoking) {
            return (
                <Button>
                    <i className=" mr-3 fas fa-spinner fa-pulse fa-lg" />
                    Revoking...
                </Button>
            );
        } else {
            return (
                <Button
                    color="primary"
                    onClick={() => {
                        this.setState({ isRevoking: true });
                        return this.props.onRevoke(this.props.requestId);
                    }}
                >
                    Revoke Approval
                </Button>
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
}
