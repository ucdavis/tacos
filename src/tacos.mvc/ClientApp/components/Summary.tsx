import * as React from "react";

interface IProps {
    onSave: () => void;
    onSubmit: () => void;
    onReset: () => void;

    canSave: boolean;
    canSubmit: boolean;

    taTotal: number;
    readerTotal: number;
    pending: number;

    isSaving: boolean;
    isSubmitting: boolean;
    isProcessing: boolean;
}

// the overall summary of totals, plus action/submit button
export default class Summary extends React.PureComponent<IProps, {}> {
    
    public saveButtonRender = () => {
        return (
            <button
                className="tacos-btn tacos-btn--primary"
                disabled={!this.props.canSave || this.props.isProcessing}
                onClick={this.props.onSave}
                type="button"
            >
                Save Changes
                <i className="far fa-save tacos-btn__icon" />
            </button>
        );
    };

    public submitButtonRender = () => {
        return (
            <button
                className="tacos-btn tacos-btn--primary"
                disabled={!this.props.canSubmit || this.props.isProcessing}
                onClick={this.props.onSubmit}
                type="button"
            >
                Submit for Approval
                <i className="far fa-thumbs-up tacos-btn__icon" />
            </button>
        );
    };

    public render() {
        return (
            <div className="tacos-summary-bar" role="navigation">
                <div className="tacos-summary-bar__banner">
                    <div className="tacos-summary-bar__content">
                        <div className="tacos-summary-bar__title">
                            TA Total:{" "}
                            {this.props.taTotal > 0 ? this.props.taTotal.toFixed(3) : "---"}
                            {" | "}
                            Reader Total:{" "}
                            {this.props.readerTotal > 0 ? this.props.readerTotal.toFixed(3) : "---"}
                        </div>
                        <div className="tacos-summary-bar__actions">
                            <button
                                disabled={this.props.isProcessing}
                                className="tacos-btn tacos-btn--danger"
                                onClick={this.props.onReset}
                                type="button"
                            >
                                Reset
                            </button>

                            {this.saveButtonRender()}

                            {this.submitButtonRender()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
