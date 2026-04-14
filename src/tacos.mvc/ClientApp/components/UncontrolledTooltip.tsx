import * as React from "react";
import { createPortal } from "react-dom";

type TooltipPlacement = "top" | "right" | "bottom" | "left";

interface IProps {
    target: string;
    placement?: TooltipPlacement;
    className?: string;
    children: React.ReactNode;
}

interface ITooltipState {
    isOpen: boolean;
    left: number;
    top: number;
    isPositioned: boolean;
}

let tooltipIdCount = 0;

const UncontrolledTooltip = ({
    children,
    className,
    placement = "top",
    target,
}: IProps) => {
    const animationFrameIdRef = React.useRef<number | null>(null);
    const tooltipId = React.useRef(`tooltip-${++tooltipIdCount}`).current;
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [{ isOpen, isPositioned, left, top }, setTooltipState] = React.useState<ITooltipState>({
        isOpen: false,
        left: 0,
        top: 0,
        isPositioned: false,
    });

    const getTargetElement = React.useCallback((targetId: string = target) => {
        if (typeof document === "undefined") {
            return null;
        }

        return document.getElementById(targetId);
    }, [target]);

    const addAriaDescription = React.useCallback((targetElement: HTMLElement) => {
        const describedBy = targetElement.getAttribute("aria-describedby");
        const ids = new Set((describedBy || "").split(/\s+/).filter(Boolean));
        ids.add(tooltipId);
        targetElement.setAttribute("aria-describedby", Array.from(ids).join(" "));
    }, [tooltipId]);

    const removeAriaDescription = React.useCallback((targetElement: HTMLElement) => {
        const describedBy = targetElement.getAttribute("aria-describedby");
        const ids = (describedBy || "")
            .split(/\s+/)
            .filter((id) => id && id !== tooltipId);

        if (ids.length > 0) {
            targetElement.setAttribute("aria-describedby", ids.join(" "));
            return;
        }

        targetElement.removeAttribute("aria-describedby");
    }, [tooltipId]);

    const updatePosition = React.useCallback(() => {
        const targetElement = getTargetElement();
        const tooltipElement = tooltipRef.current;

        if (!targetElement || !tooltipElement) {
            return;
        }

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const gap = 8;

        let nextTop = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        let nextLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        switch (placement) {
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

        setTooltipState((currentState) => {
            if (
                currentState.top === nextTop &&
                currentState.left === nextLeft &&
                currentState.isPositioned
            ) {
                return currentState;
            }

            return {
                ...currentState,
                top: nextTop,
                left: nextLeft,
                isPositioned: true,
            };
        });
    }, [getTargetElement, placement]);

    const schedulePositionUpdate = React.useCallback(() => {
        if (animationFrameIdRef.current !== null) {
            window.cancelAnimationFrame(animationFrameIdRef.current);
        }

        animationFrameIdRef.current = window.requestAnimationFrame(() => {
            animationFrameIdRef.current = null;
            updatePosition();
        });
    }, [updatePosition]);

    const showTooltip = React.useCallback(() => {
        setTooltipState((currentState) => {
            if (currentState.isOpen) {
                return currentState;
            }

            return {
                ...currentState,
                isOpen: true,
                isPositioned: false,
            };
        });
    }, []);

    const hideTooltip = React.useCallback(() => {
        setTooltipState((currentState) => {
            if (!currentState.isOpen) {
                return currentState;
            }

            return {
                ...currentState,
                isOpen: false,
                isPositioned: false,
            };
        });
    }, []);

    React.useEffect(() => {
        const targetElement = getTargetElement();
        if (!targetElement) {
            return undefined;
        }

        targetElement.addEventListener("mouseenter", showTooltip);
        targetElement.addEventListener("mouseleave", hideTooltip);
        targetElement.addEventListener("focus", showTooltip);
        targetElement.addEventListener("blur", hideTooltip);
        addAriaDescription(targetElement);

        return () => {
            targetElement.removeEventListener("mouseenter", showTooltip);
            targetElement.removeEventListener("mouseleave", hideTooltip);
            targetElement.removeEventListener("focus", showTooltip);
            targetElement.removeEventListener("blur", hideTooltip);
            removeAriaDescription(targetElement);
        };
    }, [addAriaDescription, getTargetElement, hideTooltip, removeAriaDescription, showTooltip]);

    React.useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        window.addEventListener("resize", schedulePositionUpdate);
        window.addEventListener("scroll", schedulePositionUpdate, true);
        schedulePositionUpdate();

        return () => {
            window.removeEventListener("resize", schedulePositionUpdate);
            window.removeEventListener("scroll", schedulePositionUpdate, true);
        };
    }, [isOpen, schedulePositionUpdate]);

    React.useEffect(() => {
        if (isOpen) {
            schedulePositionUpdate();
        }
    }, [children, isOpen, placement, schedulePositionUpdate]);

    React.useEffect(() => () => {
        if (animationFrameIdRef.current !== null) {
            window.cancelAnimationFrame(animationFrameIdRef.current);
        }
    }, []);

    if (typeof document === "undefined") {
        return null;
    }

    const tooltipClassName = [
        "tacos-tooltip",
        isOpen && isPositioned ? "tacos-tooltip--visible" : undefined,
        className,
    ].filter(Boolean).join(" ");

    const style: React.CSSProperties = {
        left,
        opacity: isOpen && isPositioned ? 1 : 0,
        pointerEvents: "none",
        position: "fixed",
        top,
        visibility: isOpen && isPositioned ? "visible" : "hidden",
        zIndex: 1080,
    };

    return createPortal(
        <div
            aria-hidden={!isOpen}
            className={tooltipClassName}
            data-placement={placement}
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
            style={style}
        >
            <div className="tacos-tooltip__content">{children}</div>
        </div>,
        document.body,
    );
};

export default UncontrolledTooltip;
