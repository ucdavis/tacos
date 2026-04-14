import * as React from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";

import Modal, { ModalBody, ModalHeader } from "./Modal";

describe("Modal", () => {
    let host: HTMLDivElement | undefined;
    let root: Root | undefined;

    afterEach(async () => {
        if (root) {
            await act(async () => {
                root!.unmount();
            });
            root = undefined;
        }

        if (host) {
            host.remove();
            host = undefined;
        }

        vi.unstubAllGlobals();
    });

    async function renderModal(element: React.ReactElement) {
        host = document.createElement("div");
        document.body.appendChild(host);

        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        root = createRoot(host);

        await act(async () => {
            root!.render(element);
        });
    }

    function click(element: Element) {
        act(() => {
            element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    }

    function pressEscape() {
        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
        });
    }

    it("moves focus into the modal and restores it when the modal closes", async () => {
        function Wrapper() {
            const [isOpen, setIsOpen] = React.useState(false);

            return (
                <>
                    <button id="launch-modal" type="button" onClick={() => setIsOpen(true)}>
                        Launch Modal
                    </button>
                    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                        <ModalHeader>Dialog Title</ModalHeader>
                        <ModalBody>
                            <button id="inside-modal" type="button">Inside Modal</button>
                        </ModalBody>
                    </Modal>
                </>
            );
        }

        await renderModal(<Wrapper />);

        const launchButton = document.body.querySelector("#launch-modal") as HTMLButtonElement | null;
        expect(launchButton).not.toBeNull();

        launchButton!.focus();
        expect(document.activeElement).toBe(launchButton);

        click(launchButton!);

        const dialog = document.body.querySelector("[data-tacos-modal-dialog='true'][role='dialog']") as HTMLDivElement | null;
        const titleId = dialog?.getAttribute("aria-labelledby") || "";
        const title = titleId ? document.getElementById(titleId) : null;

        expect(dialog).not.toBeNull();
        expect(title).not.toBeNull();
        expect(dialog!.getAttribute("aria-labelledby")).toBe(title!.id);
        expect(document.activeElement).toBe(document.body.querySelector("#inside-modal"));

        pressEscape();

        expect(document.body.querySelector("[data-tacos-modal-root='true']")).toBeNull();
        expect(document.activeElement).toBe(launchButton);
    });

    it("closes only the topmost modal when Escape is pressed", async () => {
        const onCloseFirst = vi.fn();
        const onCloseSecond = vi.fn();

        await renderModal(
            <>
                <Modal isOpen={true} onClose={onCloseFirst}>
                    <ModalHeader>First Modal</ModalHeader>
                    <ModalBody>
                        <button type="button">First Action</button>
                    </ModalBody>
                </Modal>
                <Modal isOpen={true} onClose={onCloseSecond}>
                    <ModalHeader>Second Modal</ModalHeader>
                    <ModalBody>
                        <button type="button">Second Action</button>
                    </ModalBody>
                </Modal>
            </>,
        );

        pressEscape();

        expect(onCloseSecond).toHaveBeenCalledTimes(1);
        expect(onCloseFirst).not.toHaveBeenCalled();
    });
});
