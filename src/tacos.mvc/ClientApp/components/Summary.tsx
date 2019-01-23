import * as React from "react";

interface IProps {
    onSave: () => void;
    onSubmit: () => void;
    onReset: () => void;

    canSave: boolean;
    canSubmit: boolean;

    total: number;
    pending: number;
}

// the overall summary of totals, plus action/submit button
export default class Summary extends React.PureComponent<IProps, {}> {
    public render() {
        const { total, pending } = this.props;

        return (
            <div className="navbar navbar-default navbar-expand-xs fixed-bottom" role="navigation">
                <div className="navbar-banner">
                    <div className="container-fluid d-flex justify-content-between">
                        <a className="navbar-brand navbar-brand mr-auto" href="#">
                            Request Total:{" "}
                            {total > 0 ? total.toFixed(3) : "---"}
                        </a>
                        <div>
                            {  pending > 0 &&
                                <span className="mr-3">{pending} Pending Changes</span>
                            }
                            {  pending > 0 &&
                                <button className="btn btn-danger" onClick={this.props.onReset}>
                                    Reset
                                </button>
                            }

                            <button
                                className="btn btn-primary"
                                id="submit-button"
                                disabled={!this.props.canSave}
                                onClick={this.props.onSave}
                            >
                                Save Changes
                                <i className="far fa-save ml-2" /> 
                            </button>

                            <button
                                className="btn btn-primary"
                                id="submit-button"
                                disabled={!this.props.canSubmit}
                                onClick={this.props.onSubmit}
                            >
                                Submit for Approval
                                <i className="far fa-thumbs-up ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
