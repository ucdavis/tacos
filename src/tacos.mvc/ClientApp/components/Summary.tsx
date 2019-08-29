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
                className="btn btn-primary"
                id="submit-button"
                disabled={!this.props.canSave || this.props.isProcessing}
                onClick={this.props.onSave}
            >
                Save Changes
                <i className="far fa-save ml-2" />
            </button>
        );
    };

    public submitButtonRender = () => {
        return (
            <button
                className="btn btn-primary"
                id="submit-button"
                disabled={!this.props.canSubmit || this.props.isProcessing}
                onClick={this.props.onSubmit}
            >
                Submit for Approval
                <i className="far fa-thumbs-up ml-2" />
            </button>
        );
    };

    public render() {
        return (
            <div className="navbar navbar-default navbar-expand-xs fixed-bottom" role="navigation">
                <div className="navbar-banner">
                    <div className="container-fluid d-flex justify-content-between">
                        <a className="navbar-brand navbar-brand mr-auto" href="#">
                            Request Total:{" "}
                            {this.props.total > 0 ? this.props.total.toFixed(3) : "---"}
                        </a>
                        <div>
                            <button
                                disabled={this.props.isProcessing}
                                className="btn btn-danger"
                                onClick={this.props.onReset}
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
