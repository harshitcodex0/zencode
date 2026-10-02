/**
 * Builds the stdin of a design problem: constructor-argument line, operation
 * count, then one operation per line.
 */
export const designInput = (ctorArgs: string, operations: string[]): string =>
    `${ctorArgs}\n${operations.length}\n${operations.join("\n")}`;

/**
 * Expected stdout for a doubly linked list result: the values from head to
 * tail, then the same values walked from the tail back using `prev`.
 */
export const dlistOutput = (forward: number[]): string =>
    `[${forward.join(",")}]\n[${[...forward].reverse().join(",")}]`;
