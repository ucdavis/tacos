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

interface IModalStackEntry {
    focusDialog: () => void;
    handleWindowKeyDown: (e: KeyboardEvent) => void;
    token: symbol;
}

let openModalCount = 0;
let modalTitleCount = 0;
const modalStack: IModalStackEntry[] = [];
const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

const joinClassNames = (...classNames: Array<string | undefined>) =>
    classNames.filter(Boolean).join(" ");

const ModalTitleContext = React.createContext<string | undefined>(undefined);

const routeWindowKeyDown = (e: KeyboardEvent) => {
    const activeModal = modalStack[modalStack.length - 1];
    activeModal?.handleWindowKeyDown(e);
};

function getFocusableElements(dialog: HTMLDivElement | null) {
    if (!dialog) {
        return [];
    }

    return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
}

function pushModalToStack(entry: IModalStackEntry) {
    const existingIndex = modalStack.findIndex((modalEntry) => modalEntry.token === entry.token);
    if (existingIndex >= 0) {
        modalStack.splice(existingIndex, 1);
    }

    modalStack.push(entry);

    if (modalStack.length === 1) {
        window.addEventListener("keydown", routeWindowKeyDown);
    }
}

function removeModalFromStack(entry: IModalStackEntry) {
    const index = modalStack.findIndex((modalEntry) => modalEntry.token === entry.token);
    if (index >= 0) {
        modalStack.splice(index, 1);
    }

    if (modalStack.length === 0) {
        window.removeEventListener("keydown", routeWindowKeyDown);
    }
}

const Modal = ({ children, centered, isOpen, onClose }: IModalProps) => {
    const dialogRef = React.useRef<HTMLDivElement>(null);
    const onCloseRef = React.useRef(onClose);
    const previousFocusedElementRef = React.useRef<HTMLElement | null>(null);
    const stackEntryRef = React.useRef<IModalStackEntry | null>(null);
    const titleId = React.useRef(`modal-title-${++modalTitleCount}`).current;

    React.useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const focusDialog = React.useCallback(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        const [firstFocusable] = getFocusableElements(dialog);
        (firstFocusable || dialog).focus();
    }, []);

    const handleWindowKeyDown = React.useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && onCloseRef.current) {
            e.preventDefault();
            onCloseRef.current();
        }
    }, []);

    if (stackEntryRef.current === null) {
        stackEntryRef.current = {
            focusDialog,
            handleWindowKeyDown,
            token: Symbol("modal"),
        };
    } else {
        stackEntryRef.current.focusDialog = focusDialog;
        stackEntryRef.current.handleWindowKeyDown = handleWindowKeyDown;
    }

    React.useEffect(() => {
        if (!isOpen || typeof document === "undefined") {
            return undefined;
        }

        openModalCount += 1;
        document.body.classList.add("modal-open");
        previousFocusedElementRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        const stackEntry = stackEntryRef.current!;
        pushModalToStack(stackEntry);
        focusDialog();

        return () => {
            openModalCount = Math.max(0, openModalCount - 1);

            if (openModalCount === 0) {
                document.body.classList.remove("modal-open");
            }

            removeModalFromStack(stackEntry);

            const activeModal = modalStack[modalStack.length - 1];
            if (activeModal) {
                activeModal.focusDialog();
                return;
            }

            const previousFocusedElement = previousFocusedElementRef.current;
            if (previousFocusedElement && document.contains(previousFocusedElement)) {
                previousFocusedElement.focus();
            }
        };
    }, [focusDialog, isOpen]);

    const handleBackdropClick = React.useCallback(() => {
        onCloseRef.current?.();
    }, []);

    const stopPropagation = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    const handleDialogKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Tab") {
            return;
        }

        const focusableElements = getFocusableElements(dialogRef.current);
        if (focusableElements.length === 0) {
            e.preventDefault();
            dialogRef.current?.focus();
            return;
        }

        const activeElement = document.activeElement as HTMLElement | null;
        const activeIndex = activeElement
            ? focusableElements.indexOf(activeElement)
            : -1;

        if (e.shiftKey) {
            if (activeIndex <= 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }

            return;
        }

        if (activeIndex === -1 || activeIndex === focusableElements.length - 1) {
            e.preventDefault();
            focusableElements[0].focus();
        }
    }, []);

    if (!isOpen || typeof document === "undefined") {
        return null;
    }

    const dialogClassName = joinClassNames(
        "modal-dialog",
        centered ? "modal-dialog-centered" : undefined,
    );

    return createPortal(
        <ModalTitleContext.Provider value={titleId}>
            <>
                <div
                    className="modal fade show"
                    style={{ display: "block" }}
                    onClick={handleBackdropClick}
                >
                    <div
                        aria-labelledby={titleId}
                        aria-modal="true"
                        className={dialogClassName}
                        onClick={stopPropagation}
                        onKeyDown={handleDialogKeyDown}
                        ref={dialogRef}
                        role="dialog"
                        tabIndex={-1}
                    >
                        <div className="modal-content">{children}</div>
                    </div>
                </div>
                <div className="modal-backdrop fade show" />
            </>
        </ModalTitleContext.Provider>,
        document.body,
    );
};

export const ModalHeader = ({ children, className }: IModalSectionProps) => {
    const titleId = React.useContext(ModalTitleContext);

    return (
        <div className={joinClassNames("modal-header", className)}>
            <h5 className="modal-title mb-0" id={titleId}>{children}</h5>
        </div>
    );
};

export const ModalBody = ({ children, className }: IModalSectionProps) => (
    <div className={joinClassNames("modal-body", className)}>{children}</div>
);

export const ModalFooter = ({ children, className }: IModalSectionProps) => (
    <div className={joinClassNames("modal-footer", className)}>{children}</div>
);

export default Modal;
