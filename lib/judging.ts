// Pure judging helpers (no I/O) so the exact same verdict logic is used by the
// `executeCode` server action and by `scripts/verify-problems.ts`.

export type Judge0Result = {
    token?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    status: { id: number; description: string };
    memory?: number | null;
    time?: string | null;
};

export type StoredTestCase = { input: string; output: string };

export type TestCaseVerdict = {
    passed: boolean;
    stdout: string | null;
    expected: string;
    /** Per test-case status label shown in the UI. */
    status: string;
};

// https://ce.judge0.com — status ids returned by Judge0
export const JUDGE0_STATUS = {
    ACCEPTED: 3,
    WRONG_ANSWER: 4,
    TIME_LIMIT_EXCEEDED: 5,
    COMPILATION_ERROR: 6,
    RUNTIME_ERROR_FIRST: 7,
    RUNTIME_ERROR_LAST: 12,
    INTERNAL_ERROR: 13,
    EXEC_FORMAT_ERROR: 14,
} as const;

/**
 * Makes output comparison insensitive to things that are not part of the
 * answer: Windows line endings, trailing spaces on a line and leading/trailing
 * blank lines. Anything else (case, inner spacing, order) still matters.
 */
export function normalizeOutput(value: string | null | undefined): string {
    if (!value) return "";
    return value
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[ \t]+$/, ""))
        .join("\n")
        .trim();
}

/**
 * A test case passes only when the program ran to completion (Judge0 status
 * "Accepted" – no compile error, runtime error, timeout, ...) AND its output
 * matches the expected output. Matching output alone is not enough, e.g. a
 * program that prints the right answer and then crashes must not pass.
 */
export function judgeTestCase(result: Judge0Result, expectedOutput: string): TestCaseVerdict {
    const expected = normalizeOutput(expectedOutput);
    const actual = normalizeOutput(result.stdout);
    const ranCleanly = result.status?.id === JUDGE0_STATUS.ACCEPTED;
    const passed = ranCleanly && actual === expected;

    let status: string;
    if (passed) status = "Accepted";
    else if (ranCleanly || result.status?.id === JUDGE0_STATUS.WRONG_ANSWER) status = "Wrong Answer";
    else status = result.status?.description ?? "Internal Error";

    return {
        passed,
        stdout: actual === "" ? null : actual,
        expected,
        status,
    };
}

/** Overall submission verdict, decided by the first failing test case. */
export function summarizeVerdict(results: Judge0Result[], verdicts: TestCaseVerdict[]): string {
    const firstFailure = verdicts.findIndex((v) => !v.passed);
    if (firstFailure === -1 && verdicts.length > 0) return "Accepted";

    const id = results[firstFailure]?.status?.id;
    if (id === JUDGE0_STATUS.COMPILATION_ERROR) return "Compilation Error";
    if (id === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) return "Time Limit Exceeded";
    if (
        id !== undefined &&
        id >= JUDGE0_STATUS.RUNTIME_ERROR_FIRST &&
        id <= JUDGE0_STATUS.RUNTIME_ERROR_LAST
    ) {
        return "Runtime Error";
    }
    if (id === JUDGE0_STATUS.INTERNAL_ERROR || id === JUDGE0_STATUS.EXEC_FORMAT_ERROR) {
        return "Internal Error";
    }
    return "Wrong Answer";
}

/** Defensive parse of the `Problem.testCases` JSON column. */
export function parseStoredTestCases(raw: unknown): StoredTestCase[] | null {
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const parsed: StoredTestCase[] = [];
    for (const item of raw) {
        if (
            !item ||
            typeof item !== "object" ||
            typeof (item as StoredTestCase).input !== "string" ||
            typeof (item as StoredTestCase).output !== "string"
        ) {
            return null;
        }
        parsed.push({
            input: (item as StoredTestCase).input,
            output: (item as StoredTestCase).output,
        });
    }
    return parsed;
}
