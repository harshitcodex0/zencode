export type Lang = "JAVASCRIPT" | "PYTHON" | "JAVA";
export const LANGS: Lang[] = ["JAVASCRIPT", "PYTHON", "JAVA"];

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/**
 * Parameter types understood by the harness generator. Every type has a fixed
 * stdin layout (see `describeInput` in builder.ts):
 *  - int / str / int[] / str[] / list / dlist  -> exactly one line
 *  - int[][]                                   -> a "R C" line followed by R lines
 */
export type ParamType = "int" | "str" | "int[]" | "str[]" | "int[][]" | "list" | "dlist";

/** `qstr` prints the string wrapped in double quotes so "" and leading/trailing spaces are visible. */
export type ReturnType = ParamType | "bool" | "qstr";

// `type` (not `interface`) so these are assignable to Prisma's Json input types.
export type TestCase = {
    input: string;
    output: string;
};

export type Example = {
    input: string;
    output: string;
    explanation: string;
};

export interface Solution {
    /** Function body only (no signature). Indented relative to column 0. */
    body: string;
    /** Extra helper code placed after the main function (static methods in Java, methods in Python). */
    helpers?: string;
}

interface BaseSpec {
    /** Stable identifier used by the verifier and the seeder. */
    slug: string;
    title: string;
    difficulty: Difficulty;
    tags: string[];
    /** Problem statement. The "Input Format"/"Output Format" sections are generated automatically. */
    statement: string;
    constraints: string;
    hints: string;
    editorial: string;
    /** Three human-readable examples shown on the problem page. */
    examples: [Example, Example, Example];
    /** Raw stdin / expected stdout pairs executed by the judge. */
    testCases: TestCase[];
}

export interface FunctionSpec extends BaseSpec {
    kind: "function";
    fn: {
        name: string;
        params: { name: string; type: ParamType }[];
        returns: ReturnType;
    };
    solutions: Record<Lang, Solution>;
    /** A plausible-but-wrong Python solution; the verifier asserts the test cases reject it. */
    wrong: Solution;
}

export interface DesignMethod {
    name: string;
    /** All design-problem arguments are integers. */
    params: string[];
    returns: "void" | "int" | "bool";
}

export interface DesignSpec extends BaseSpec {
    kind: "design";
    design: {
        className: string;
        ctorParams: string[];
        methods: DesignMethod[];
    };
    /** Complete class source per language (helper classes included). */
    solutions: Record<Lang, string>;
    /** A plausible-but-wrong Python implementation (complete class source). */
    wrong: string;
}

export type ProblemSpec = FunctionSpec | DesignSpec;

/** Shape persisted in the `Problem` table (matches POST /api/create-problem). */
export interface ProblemRecord {
    title: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    examples: Record<Lang, Example>;
    constraints: string;
    hints: string;
    editorial: string;
    testCases: TestCase[];
    codeSnippets: Record<Lang, string>;
    referenceSolutions: Record<Lang, string>;
}
