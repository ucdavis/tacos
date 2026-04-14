import * as React from "react";

interface IProps {
    onSave: () => void;
    onSubmit: () => void;
    onReset: () => void;

    canSave: boolean;
    canSubmit: boolean;

    total: number;
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
                id="submit-button"
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
                id="submit-button"
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
            <div className="navbar navbar-default tacos-summary-bar" role="navigation">
                <div className="navbar-banner">
                    <div className="tacos-summary-bar__content">
                        <a className="navbar-brand tacos-summary-bar__title" href="#">
                            Request Total:{" "}
                            {this.props.total > 0 ? this.props.total.toFixed(3) : "---"}
                        </a>
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
