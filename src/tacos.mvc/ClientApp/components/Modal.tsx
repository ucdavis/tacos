import * as React from "react";
import { createPortal } from "react-dom";

interface IModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    centered?: boolean;
    onClose?: () => void;
}

interface IModalSectionProps {
    children: React.ReactNode;
    className?: string;
}

let openModalCount = 0;

const joinClassNames = (...classNames: Array<string | undefined>) =>
    classNames.filter(Boolean).join(" ");

class Modal extends React.PureComponent<IModalProps> {
    private hasBodyLock = false;

    public componentDidMount() {
        if (this.props.isOpen) {
            this.onOpen();
        }
    }

    public componentDidUpdate(prevProps: IModalProps) {
        if (!prevProps.isOpen && this.props.isOpen) {
            this.onOpen();
        }

        if (prevProps.isOpen && !this.props.isOpen) {
            this.onCloseModal();
        }
    }

    public componentWillUnmount() {
        this.onCloseModal();
    }

    public render() {
        const { children, centered, isOpen } = this.props;

        if (!isOpen || typeof document === "undefined") {
            return null;
        }

        const dialogClassName = joinClassNames(
            "modal-dialog",
            centered ? "modal-dialog-centered" : undefined,
        );

        return createPortal(
            <>
                <div
                    className="modal fade show"
                    style={{ display: "block" }}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    onClick={this.handleBackdropClick}
                >
                    <div className={dialogClassName} role="document" onClick={this.stopPropagation}>
                        <div className="modal-content">{children}</div>
                    </div>
                </div>
                <div className="modal-backdrop fade show" />
            </>,
            document.body,
        );
    }

    private onOpen = () => {
        if (!this.hasBodyLock) {
            openModalCount += 1;
            this.hasBodyLock = true;
        }

        document.body.classList.add("modal-open");
        window.addEventListener("keydown", this.handleKeyDown);
    };

    private onCloseModal = () => {
        if (!this.hasBodyLock) {
            return;
        }

        openModalCount = Math.max(0, openModalCount - 1);
        this.hasBodyLock = false;

        if (openModalCount === 0) {
            document.body.classList.remove("modal-open");
        }

        window.removeEventListener("keydown", this.handleKeyDown);
    };

    private handleBackdropClick = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && this.props.onClose) {
            e.preventDefault();
            this.props.onClose();
        }
    };

    private stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
}

export const ModalHeader = ({ children, className }: IModalSectionProps) => (
    <div className={joinClassNames("modal-header", className)}>
        <h5 className="modal-title mb-0">{children}</h5>
    </div>
);

export const ModalBody = ({ children, className }: IModalSectionProps) => (
    <div className={joinClassNames("modal-body", className)}>{children}</div>
);

export const ModalFooter = ({ children, className }: IModalSectionProps) => (
    <div className={joinClassNames("modal-footer", className)}>{children}</div>
);

export default Modal;
