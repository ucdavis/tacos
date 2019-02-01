import * as React from "react";
import { Tooltip, TooltipProps } from "reactstrap";
import { compose, defaultProps } from "recompose";

// the typing for this element isn't complete, so we're wrapping the component to fix it
interface IProps extends TooltipProps {
    boundariesElement?: string | HTMLElement;
}

interface IState {
    isOpen: boolean;
}

class UncontrolledTooltip extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    public render() {
        return (
            <Tooltip
                {...this.props}
                isOpen={this.state.isOpen}
                toggle={this.toggle}
            />
        );
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };
}

export default compose<IProps, IProps>(
    defaultProps({
        boundariesElement: "viewport",
    }))(UncontrolledTooltip)
