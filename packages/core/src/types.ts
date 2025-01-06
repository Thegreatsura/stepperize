export type Step = { id: string } & Record<string, any>;

export type Stepper<Steps extends Step[] = Step[]> = {
	/** Returns all steps. */
	all: Steps;
	/** Returns the current step. */
	current: Steps[number];
	/** Returns true if the current step is the last step. */
	isLast: boolean;
	/** Returns true if the current step is the first step. */
	isFirst: boolean;
	/** Advances to the next step. */
	next: () => void;
	/** Returns to the previous step. */
	prev: () => void;
	/** Returns a step by its ID. */
	get: <Id extends StepperGet.Id<Steps>>(id: Id) => StepperGet.StepById<Steps, Id>;
	/** Navigates to a specific step by its ID. */
	goTo: (id: StepperGet.Id<Steps>) => void;
	/** Resets the stepper to its initial state. */
	reset: () => void;
	/**
	 * Executes a function based on the current step ID.
	 * @param id - The ID of the step to check.
	 * @param whenFn - Function to execute if the current step matches the ID.
	 * @param elseFn - Optional function to execute if the current step does not match the ID.
	 * @returns The result of whenFn or elseFn.
	 */
	when: <Id extends StepperGet.Id<Steps>, R1, R2>(
		id: Id | [Id, ...boolean[]],
		whenFn: (step: StepperGet.StepById<Steps, Id>) => R1,
		elseFn?: (step: StepperGet.StepSansId<Steps, Id>) => R2,
	) => R1 | R2;
	/**
	 * Executes a function based on a switch-case-like structure for steps.
	 * @param when - An object mapping step IDs to functions.
	 * @returns The result of the function corresponding to the current step ID.
	 */
	switch: <R>(when: StepperGet.Switch<Steps, R>) => R;
	/**
	 * Matches the current state with a set of possible states and executes the corresponding function.
	 * @param state - The current state ID.
	 * @param matches - An object mapping state IDs to functions.
	 * @returns The result of the matched function or null if no match is found.
	 */
	match: <State extends StepperGet.Id<Steps>, R>(state: State, matches: StepperGet.Switch<Steps, R>) => R | null;
};

export type StepperUtils<Steps extends Step[] = Step[]> = {
	/**
	 * Retrieves all steps.
	 * @returns An array of all steps.
	 */
	getAll: () => Steps;
	/**
	 * Retrieves a step by its ID.
	 * @param id - The ID of the step to retrieve.
	 * @returns The step with the specified ID.
	 */
	get: <Id extends StepperGet.Id<Steps>>(id: Id) => StepperGet.StepById<Steps, Id>;
	/**
	 * Retrieves the index of a step by its ID.
	 * @param id - The ID of the step to retrieve the index for.
	 * @returns The index of the step.
	 */
	getIndex: <Id extends StepperGet.Id<Steps>>(id: Id) => number;
	/**
	 * Retrieves a step by its index.
	 * @param index - The index of the step to retrieve.
	 * @returns The step at the specified index.
	 */
	getByIndex: <Index extends number>(index: Index) => Steps[Index];
	/**
	 * Retrieves the first step.
	 * @returns The first step.
	 */
	getFirst: () => Steps[number];
	/**
	 * Retrieves the last step.
	 * @returns The last step.
	 */
	getLast: () => Steps[number];
	/**
	 * Retrieves the next step after the specified ID.
	 * @param id - The ID of the current step.
	 * @returns The next step.
	 */
	getNext: <Id extends StepperGet.Id<Steps>>(id: Id) => Steps[number];
	/**
	 * Retrieves the previous step before the specified ID.
	 * @param id - The ID of the current step.
	 * @returns The previous step.
	 */
	getPrev: <Id extends StepperGet.Id<Steps>>(id: Id) => Steps[number];
	/**
	 * Retrieves the neighboring steps (previous and next) of the specified step.
	 * @param id - The ID of the current step.
	 * @returns An object containing the previous and next steps.
	 */
	getNeighbors: <Id extends StepperGet.Id<Steps>>(id: Id) => { prev: Steps[number] | null; next: Steps[number] | null };
};

export namespace StepperGet {
	/** Returns a union of possible IDs from the given Steps. */
	export type Id<Steps extends Step[] = Step[]> = Steps[number]["id"];

	/** Returns a Step from the given Steps with the given Step Id. */
	export type StepById<Steps extends Step[], Id extends StepperGet.Id<Steps>> = Extract<Steps[number], { id: Id }>;

	/** Returns any Steps from the given Steps without the given Step Id. */
	export type StepSansId<Steps extends Step[], Id extends StepperGet.Id<Steps>> = Exclude<Steps[number], { id: Id }>;

	/** Returns any Steps from the given Steps without the given Step Id. */
	export type Switch<Steps extends Step[], R> = {
		[Id in StepperGet.Id<Steps>]?: (step: StepperGet.StepById<Steps, Id>) => R;
	};
}
