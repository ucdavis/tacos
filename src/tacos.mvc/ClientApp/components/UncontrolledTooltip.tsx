import * as React from "react";
import { Tooltip, TooltipProps } from "reactstrap";

// the typing for this element isn't complete, so we're wrapping the component to fix it
interface IProps extends TooltipProps {
    boundariesElement?: string | HTMLElement;
}

interface IState {
    isOpen: boolean;
}

class UncontrolledTooltip extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        boundariesElement: "viewport",
    };

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

export default UncontrolledTooltip;
