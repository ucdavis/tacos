import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import debounce from "./debounce";

describe("debounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it("waits to invoke the wrapped function until the delay has elapsed", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 100);

        debounced("alpha");

        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(99);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith("alpha");
    });

    it("coalesces rapid calls and uses the latest arguments", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 100);

        debounced("first");
        vi.advanceTimersByTime(50);
        debounced("second");

        vi.advanceTimersByTime(99);
        expect(callback).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith("second");
    });

    it("supports immediate invocation without a trailing call", () => {
        const callback = vi.fn();
        const debounced = debounce(callback, 100, { isImmediate: true });

        debounced("first");
        debounced("second");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith("first");

        vi.advanceTimersByTime(100);
        expect(callback).toHaveBeenCalledTimes(1);

        debounced("third");
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith("third");
    });
});
