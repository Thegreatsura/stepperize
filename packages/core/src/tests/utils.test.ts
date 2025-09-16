import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	executeTransition,
	generateCommonStepperUseFns,
	generateStepperUtils,
	getInitialMetadata,
	getInitialStepIndex,
	updateStepIndex,
} from "../utils";

const steps = [
	{ id: "first", label: "Step 1" },
	{ id: "second", label: "Step 2" },
	{ id: "third", label: "Step 3" },
];

describe("generateStepperUtils", () => {
	const utils = generateStepperUtils(...steps);

	it("returns all steps", () => {
		expect(utils.getAll()).toEqual(steps);
	});

	it("get returns a step by id", () => {
		expect(utils.get("second")).toEqual({ id: "second", label: "Step 2" });
	});

	it("getIndex returns index by id", () => {
		expect(utils.getIndex("third")).toBe(2);
	});

	it("getByIndex returns step by index", () => {
		expect(utils.getByIndex(0)).toEqual(steps[0]);
	});

	it("getFirst and getLast return extremes", () => {
		expect(utils.getFirst()).toEqual(steps[0]);
		expect(utils.getLast()).toEqual(steps[2]);
	});

	it("getNext and getPrev return neighbors", () => {
		expect(utils.getNext("first")).toEqual(steps[1]);
		expect(utils.getPrev("third")).toEqual(steps[1]);
	});

	it("getNeighbors returns prev and next correctly", () => {
		expect(utils.getNeighbors("second")).toEqual({
			prev: steps[0],
			next: steps[2],
		});
		expect(utils.getNeighbors("first")).toEqual({ prev: null, next: steps[1] });
		expect(utils.getNeighbors("third")).toEqual({ prev: steps[1], next: null });
	});
});

describe("getInitialStepIndex", () => {
	it("returns 0 if no initialStep is passed", () => {
		expect(getInitialStepIndex(steps)).toBe(0);
	});

	it("returns correct index if the step exists", () => {
		expect(getInitialStepIndex(steps, "second")).toBe(1);
	});

	it("returns 0 if the step does not exist", () => {
		expect(getInitialStepIndex(steps, "not-exist" as any)).toBe(0);
	});
});

describe("getInitialMetadata", () => {
	it("returns null by default for each step", () => {
		const metadata = getInitialMetadata(steps);
		expect(metadata).toEqual({ first: null, second: null, third: null });
	});

	it("applies initial metadata if passed", () => {
		const metadata = getInitialMetadata(steps, { first: { foo: "bar" } });
		expect(metadata.first).toEqual({ foo: "bar" });
		expect(metadata.second).toBeNull();
	});
});

describe("generateCommonStepperUseFns", () => {
	const fns = generateCommonStepperUseFns(steps, steps[1], 1);

	it("switch executes function of the current step", () => {
		const result = fns.switch({
			second: (s) => `Hola ${s.label}`,
		});
		expect(result).toBe("Hola Step 2");
	});

	it("when executes whenFn if id matches", () => {
		const result = fns.when(
			"second",
			(s: (typeof steps)[0]) => s.label,
			() => "nope",
		);
		expect(result).toBe("Step 2");
	});

	it("when executes elseFn if id does not match", () => {
		const result = fns.when(
			"first",
			() => "ok",
			() => "fallback",
		);
		expect(result).toBe("fallback");
	});

	it("match executes function associated with the state", () => {
		const result = fns.match("second", {
			second: (s) => s.label,
		});
		expect(result).toBe("Step 2");
	});

	it("match returns null if there is no step", () => {
		const result = fns.match("unknown" as any, {});
		expect(result).toBeNull();
	});
});

describe("executeTransition", () => {
	let mockStepper: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockStepper = {
			next: vi.fn(),
			prev: vi.fn(),
			goTo: vi.fn(),
		};
	});

	it("executes next with callback before that returns true", async () => {
		const cb = vi.fn().mockResolvedValue(true);
		await executeTransition({ stepper: mockStepper as any, direction: "next", callback: cb, before: true });
		expect(mockStepper.next).toHaveBeenCalled();
		expect(cb).toHaveBeenCalled();
	});

	it("does not execute anything if callback before returns false", async () => {
		const cb = vi.fn().mockResolvedValue(false);
		await executeTransition({ stepper: mockStepper as any, direction: "next", callback: cb, before: true });
		expect(mockStepper.next).not.toHaveBeenCalled();
	});

	it("executes prev when direction=prev", async () => {
		const cb = vi.fn();
		await executeTransition({ stepper: mockStepper as any, direction: "prev", callback: cb, before: true });
		expect(mockStepper.prev).toHaveBeenCalled();
	});

	it("executes goTo when direction=goTo", async () => {
		const cb = vi.fn();
		await executeTransition({
			stepper: mockStepper as any,
			direction: "goTo",
			callback: cb,
			before: true,
			targetId: "second",
		});
		expect(mockStepper.goTo).toHaveBeenCalledWith("second");
	});

	it("executes callback in after (before=false)", async () => {
		const cb = vi.fn();
		await executeTransition({ stepper: mockStepper as any, direction: "next", callback: cb, before: false });
		expect(cb).toHaveBeenCalled();
	});
});

describe("updateStepIndex", () => {
	it("sets valid index", () => {
		const setter = vi.fn();
		updateStepIndex(steps, 1, setter);
		expect(setter).toHaveBeenCalledWith(1);
	});

	it("throws error if newIndex < 0", () => {
		const setter = vi.fn();
		expect(() => updateStepIndex(steps, -1, setter)).toThrowError(/first step/);
	});

	it("throws error if newIndex >= steps.length", () => {
		const setter = vi.fn();
		expect(() => updateStepIndex(steps, 10, setter)).toThrowError(/last step/);
	});
});
