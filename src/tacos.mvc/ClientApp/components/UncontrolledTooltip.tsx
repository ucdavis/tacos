import * as React from "react";
import { createPortal } from "react-dom";

type TooltipPlacement = "top" | "right" | "bottom" | "left";

interface IProps {
    target: string;
    placement?: TooltipPlacement;
    className?: string;
    children: React.ReactNode;
}

interface IState {
    isOpen: boolean;
    left: number;
    top: number;
    isPositioned: boolean;
}

class UncontrolledTooltip extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        placement: "top",
    };

    private tooltipRef = React.createRef<HTMLDivElement>();
    private animationFrameId: number | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isOpen: false,
            left: 0,
            top: 0,
            isPositioned: false,
        };
    }

    public componentDidMount() {
        this.attachTargetListeners();
    }

    public componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (prevProps.target !== this.props.target) {
            this.detachTargetListeners(prevProps.target);
            this.attachTargetListeners();
        }

        if (!prevState.isOpen && this.state.isOpen) {
            window.addEventListener("resize", this.schedulePositionUpdate);
            window.addEventListener("scroll", this.schedulePositionUpdate, true);
            this.schedulePositionUpdate();
        }

        if (prevState.isOpen && !this.state.isOpen) {
            window.removeEventListener("resize", this.schedulePositionUpdate);
            window.removeEventListener("scroll", this.schedulePositionUpdate, true);
        }

        if (
            this.state.isOpen &&
            (prevProps.placement !== this.props.placement || prevProps.children !== this.props.children)
        ) {
            this.schedulePositionUpdate();
        }
    }

    public componentWillUnmount() {
        this.detachTargetListeners(this.props.target);
        window.removeEventListener("resize", this.schedulePositionUpdate);
        window.removeEventListener("scroll", this.schedulePositionUpdate, true);

        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(this.animationFrameId);
        }
    }

    public render() {
        const { children, className, placement } = this.props;
        const { isOpen, isPositioned, left, top } = this.state;

        if (!isOpen || typeof document === "undefined") {
            return null;
        }

        const tooltipClassName = [
            "tooltip",
            `bs-tooltip-${placement}`,
            "show",
            className,
        ].filter(Boolean).join(" ");

        const style: React.CSSProperties = {
            left,
            pointerEvents: "none",
            position: "fixed",
            top,
            visibility: isPositioned ? "visible" : "hidden",
        };

        return (
            createPortal(
                <div ref={this.tooltipRef} className={tooltipClassName} style={style} role="tooltip">
                    <div className="arrow" />
                    <div className="tooltip-inner">{children}</div>
                </div>,
                document.body,
            )
        );
    }

    private getTargetElement = (targetId: string = this.props.target) => {
        if (typeof document === "undefined") {
            return null;
        }

        return document.getElementById(targetId);
    };

    private attachTargetListeners = () => {
        const target = this.getTargetElement();
        if (!target) {
            return;
        }

        target.addEventListener("mouseenter", this.showTooltip);
        target.addEventListener("mouseleave", this.hideTooltip);
        target.addEventListener("focus", this.showTooltip);
        target.addEventListener("blur", this.hideTooltip);
    };

    private detachTargetListeners = (targetId: string) => {
        const target = this.getTargetElement(targetId);
        if (!target) {
            return;
        }

        target.removeEventListener("mouseenter", this.showTooltip);
        target.removeEventListener("mouseleave", this.hideTooltip);
        target.removeEventListener("focus", this.showTooltip);
        target.removeEventListener("blur", this.hideTooltip);
    };

    private showTooltip = () => {
        if (this.state.isOpen) {
            return;
        }

        this.setState(
            {
                isOpen: true,
                isPositioned: false,
            },
            this.schedulePositionUpdate,
        );
    };

    private hideTooltip = () => {
        if (!this.state.isOpen) {
            return;
        }

        this.setState({
            isOpen: false,
            isPositioned: false,
        });
    };

    private schedulePositionUpdate = () => {
        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(this.animationFrameId);
        }

        this.animationFrameId = window.requestAnimationFrame(() => {
            this.animationFrameId = null;
            this.updatePosition();
        });
    };

    private updatePosition = () => {
        const target = this.getTargetElement();
        const tooltip = this.tooltipRef.current;

        if (!target || !tooltip) {
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const gap = 8;

        let nextTop = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        let nextLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        switch (this.props.placement) {
            case "left":
                nextLeft = targetRect.left - tooltipRect.width - gap;
                break;
            case "right":
                nextLeft = targetRect.right + gap;
                break;
            case "bottom":
                nextTop = targetRect.bottom + gap;
                break;
            case "top":
            default:
                nextTop = targetRect.top - tooltipRect.height - gap;
                break;
        }

        const maxTop = Math.max(8, window.innerHeight - tooltipRect.height - 8);
        const maxLeft = Math.max(8, window.innerWidth - tooltipRect.width - 8);

        nextTop = Math.min(Math.max(8, nextTop), maxTop);
        nextLeft = Math.min(Math.max(8, nextLeft), maxLeft);

        this.setState((prevState) => {
            if (
                prevState.top === nextTop &&
                prevState.left === nextLeft &&
                prevState.isPositioned
            ) {
                return null;
            }

            return {
                top: nextTop,
                left: nextLeft,
                isPositioned: true,
            };
        });
    };
}

export default UncontrolledTooltip;
