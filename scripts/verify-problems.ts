/**
 * Audit tool for the problem bank.
 *
 *   pnpm verify:problems                # everything
 *   pnpm verify:problems -- --only=two-sum,valid-anagram
 *   pnpm verify:problems -- --skip-java # no JDK available
 *
 * For every problem it proves the judging pipeline behaves correctly:
 *   1. the reference solution in JavaScript, Python AND Java is Accepted on every test case,
 *   2. the untouched starter code is NOT accepted (so empty submissions can never pass),
 *   3. a plausible-but-wrong solution is NOT accepted (so the tests really catch bugs),
 *   4. structural checks on the test data itself.
 * Programs are executed locally and their result is converted to the same shape Judge0
 * returns, then judged with lib/judging.ts - the exact code `executeCode` uses.
 */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
    JUDGE0_STATUS,
    Judge0Result,
    judgeTestCase,
    normalizeOutput,
    summarizeVerdict,
} from "../lib/judging";
import { buildSource, buildWrongPython } from "../modules/problems/problem-bank/builder";
import { PROBLEM_SPECS } from "../modules/problems/problem-bank";
import type { Lang, ProblemSpec, TestCase } from "../modules/problems/problem-bank/types";
import { SAMPLE_PROBLEMS } from "../modules/problems/constant/sample-problem";

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice("--only=".length).split(",");
const skipJava = args.includes("--skip-java");
const PYTHON_BIN = process.env.PYTHON_BIN ?? "python";
const TIMEOUT_MS = 15000;
const CONCURRENCY = 4;
const MAX_SOURCE_LENGTH = 10000; // limit enforced by executeCode

// ---------------------------------------------------------------------------
// Process execution
// ---------------------------------------------------------------------------

type RunOutput = { stdout: string; stderr: string; code: number | null; timedOut: boolean };

function run(cmd: string, cmdArgs: string[], cwd: string, input: string): Promise<RunOutput> {
    return new Promise((resolve) => {
        const child = spawn(cmd, cmdArgs, { cwd, stdio: ["pipe", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, TIMEOUT_MS);

        child.stdout.on("data", (d) => (stdout += d));
        child.stderr.on("data", (d) => (stderr += d));
        child.on("error", (e) => {
            clearTimeout(timer);
            resolve({ stdout, stderr: String(e), code: -1, timedOut });
        });
        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({ stdout, stderr, code, timedOut });
        });
        child.stdin.on("error", () => {});
        child.stdin.end(input);
    });
}

function toJudge0Result(out: RunOutput): Judge0Result {
    let status: Judge0Result["status"] = { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" };
    if (out.timedOut) status = { id: JUDGE0_STATUS.TIME_LIMIT_EXCEEDED, description: "Time Limit Exceeded" };
    else if (out.code !== 0) status = { id: 11, description: "Runtime Error (NZEC)" };
    return { stdout: out.stdout, stderr: out.stderr || null, status };
}

/** Runs `source` once per input and returns Judge0-shaped results. */
async function execute(lang: Lang, source: string, inputs: string[]): Promise<Judge0Result[]> {
    const dir = await mkdtemp(path.join(tmpdir(), "zen-verify-"));
    try {
        if (lang === "JAVA") {
            await writeFile(path.join(dir, "Main.java"), source);
            await mkdir(path.join(dir, "out"));
            // --release 17 == the JDK Judge0 uses (language id 91): rejects newer APIs.
            const compile = await run("javac", ["--release", "17", "-d", "out", "Main.java"], dir, "");
            if (compile.code !== 0) {
                const failed: Judge0Result = {
                    stdout: null,
                    compile_output: compile.stderr || compile.stdout,
                    status: { id: JUDGE0_STATUS.COMPILATION_ERROR, description: "Compilation Error" },
                };
                return inputs.map(() => failed);
            }
            return Promise.all(inputs.map((input) => run("java", ["-cp", "out", "Main"], dir, input).then(toJudge0Result)));
        }

        const file = lang === "JAVASCRIPT" ? "main.js" : "main.py";
        await writeFile(path.join(dir, file), source);
        const [cmd, cmdArgs] = lang === "JAVASCRIPT" ? ["node", [file]] : [PYTHON_BIN, [file]];
        // Python/Node compile errors surface as a non-zero exit, same as on Judge0 (NZEC / runtime error).
        return Promise.all(inputs.map((input) => run(cmd, cmdArgs, dir, input).then(toJudge0Result)));
    } finally {
        // Windows can keep the directory locked for a moment after a process exits.
        await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }).catch(() => {});
    }
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

type Outcome = { verdict: string; failures: string[] };

async function judgeSource(spec: { testCases: TestCase[] }, lang: Lang, source: string): Promise<Outcome> {
    const results = await execute(lang, source, spec.testCases.map((t) => t.input));
    const verdicts = results.map((r, i) => judgeTestCase(r, spec.testCases[i].output));
    const failures: string[] = [];
    verdicts.forEach((v, i) => {
        if (v.passed) return;
        const r = results[i];
        failures.push(
            [
                `    test ${i + 1}: ${v.status}`,
                `      input    : ${JSON.stringify(spec.testCases[i].input)}`,
                `      expected : ${JSON.stringify(v.expected)}`,
                `      actual   : ${JSON.stringify(v.stdout)}`,
                r.stderr || r.compile_output
                    ? `      stderr   : ${String(r.stderr || r.compile_output).trim().split("\n").slice(-3).join(" | ")}`
                    : "",
            ]
                .filter(Boolean)
                .join("\n"),
        );
    });
    return { verdict: summarizeVerdict(results, verdicts), failures };
}

const BANNED_JS_APIS = /\.(toSorted|toReversed|toSpliced|findLast|findLastIndex)\(|Object\.groupBy|Array\.fromAsync|structuredClone/;

function structuralChecks(spec: ProblemSpec): string[] {
    const problems: string[] = [];
    if (spec.testCases.length < 5) problems.push(`needs at least 5 test cases (has ${spec.testCases.length})`);
    if (spec.testCases.length > 50) problems.push("more than 50 test cases (executeCode limit)");

    const outputs = spec.testCases.map((t) => normalizeOutput(t.output));
    if (outputs.some((o) => o === "")) problems.push("a test case has an empty expected output");
    if (new Set(outputs).size < 2) problems.push("all expected outputs are identical - constant answers would pass");
    if (spec.kind === "function" && spec.fn.returns === "bool") {
        if (!outputs.includes("true") || !outputs.includes("false")) problems.push("bool problem must have both true and false cases");
    }
    const inputs = spec.testCases.map((t) => t.input);
    if (new Set(inputs).size !== inputs.length) problems.push("duplicate test case inputs");
    if (spec.testCases.some((t) => t.input.length > 5000)) problems.push("test input longer than 5000 chars");

    if (spec.tags.length === 0) problems.push("no tags");
    if (spec.title.length > 200) problems.push("title too long");

    for (const lang of ["JAVASCRIPT", "PYTHON", "JAVA"] as Lang[]) {
        const solution = buildSource(spec, lang, true);
        const starter = buildSource(spec, lang, false);
        if (solution.length > MAX_SOURCE_LENGTH) problems.push(`${lang} reference is ${solution.length} chars (> ${MAX_SOURCE_LENGTH})`);
        if (starter.length > MAX_SOURCE_LENGTH) problems.push(`${lang} starter is ${starter.length} chars (> ${MAX_SOURCE_LENGTH})`);
        if (lang === "JAVASCRIPT" && BANNED_JS_APIS.test(solution)) problems.push("JS reference uses an API missing from Node 18 (Judge0)");
    }
    return problems;
}

// ---------------------------------------------------------------------------
// Judging module self-test (pure logic, no processes)
// ---------------------------------------------------------------------------

function selfTestJudging(): string[] {
    const fails: string[] = [];
    const ok = (stdout: string | null, id = 3): Judge0Result => ({ stdout, status: { id, description: "x" } });
    const expectPass = (name: string, r: Judge0Result, expected: string, want: boolean) => {
        const got = judgeTestCase(r, expected).passed;
        if (got !== want) fails.push(`${name}: expected passed=${want}, got ${got}`);
    };

    expectPass("exact match", ok("42\n"), "42", true);
    expectPass("CRLF output", ok("[1,2]\r\n"), "[1,2]", true);
    expectPass("trailing spaces per line", ok("a  \nb \n"), "a\nb", true);
    expectPass("wrong value", ok("41\n"), "42", false);
    expectPass("different case", ok("True\n"), "true", false);
    expectPass("inner spacing matters", ok("[1, 2]"), "[1,2]", false);
    expectPass("empty vs empty", ok(null), "", true);
    expectPass("empty vs value", ok(null), "0", false);
    expectPass("right output but runtime error", ok("42\n", 11), "42", false);
    expectPass("right output but time limit", ok("42\n", 5), "42", false);
    expectPass("compile error", { stdout: null, status: { id: 6, description: "Compilation Error" } }, "42", false);

    const mk = (id: number): Judge0Result => ({ stdout: "1", status: { id, description: "x" } });
    const summary = (ids: number[], passed: boolean[]) =>
        summarizeVerdict(ids.map(mk), passed.map((p) => ({ passed: p, stdout: null, expected: "", status: "" })));
    const checks: [string, string, string][] = [
        ["all passed", summary([3, 3], [true, true]), "Accepted"],
        ["wrong answer", summary([3, 3], [true, false]), "Wrong Answer"],
        ["compile error", summary([6, 6], [false, false]), "Compilation Error"],
        ["runtime error", summary([3, 11], [true, false]), "Runtime Error"],
        ["tle", summary([5], [false]), "Time Limit Exceeded"],
        ["first failure wins", summary([3, 5], [false, false]), "Wrong Answer"],
    ];
    for (const [name, got, want] of checks) if (got !== want) fails.push(`summary ${name}: expected ${want}, got ${got}`);
    return fails;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
    const queue = [...items];
    await Promise.all(
        Array.from({ length: limit }, async () => {
            for (let item = queue.shift(); item !== undefined; item = queue.shift()) await worker(item);
        }),
    );
}

async function main() {
    let failed = 0;
    const fail = (msg: string) => {
        failed++;
        console.log(msg);
    };

    console.log("== judging module self-test");
    const selfFails = selfTestJudging();
    selfFails.forEach((f) => fail(`  FAIL ${f}`));
    if (!selfFails.length) console.log("  ok");

    const specs = PROBLEM_SPECS.filter((s) => !only || only.includes(s.slug));
    console.log(`\n== problem bank: ${specs.length} problem(s)${only ? ` (filtered: ${only.join(", ")})` : ""}`);

    const slugs = new Set<string>();
    const titles = new Set<string>();
    for (const s of PROBLEM_SPECS) {
        if (slugs.has(s.slug)) fail(`FAIL duplicate slug ${s.slug}`);
        if (titles.has(s.title)) fail(`FAIL duplicate title ${s.title}`);
        slugs.add(s.slug);
        titles.add(s.title);
    }

    const langs: Lang[] = skipJava ? ["JAVASCRIPT", "PYTHON"] : ["JAVASCRIPT", "PYTHON", "JAVA"];
    const reports = new Map<string, string[]>();
    const wrongNotes: string[] = [];

    await pool(specs, CONCURRENCY, async (spec) => {
        const lines: string[] = [];
        let bad = false;
        const note = (ok: boolean, label: string, detail: string[] = []) => {
            lines.push(`  ${ok ? "ok  " : "FAIL"} ${label}`);
            if (!ok) {
                bad = true;
                lines.push(...detail);
            }
        };

        const structural = structuralChecks(spec);
        note(structural.length === 0, "test data / structure", structural.map((p) => `    - ${p}`));

        for (const lang of langs) {
            const ref = await judgeSource(spec, lang, buildSource(spec, lang, true));
            note(ref.verdict === "Accepted", `${lang.padEnd(10)} reference -> ${ref.verdict}`, ref.failures);

            const stub = await judgeSource(spec, lang, buildSource(spec, lang, false));
            const stubOk = stub.verdict !== "Accepted" && stub.verdict !== "Compilation Error";
            note(stubOk, `${lang.padEnd(10)} starter   -> ${stub.verdict} (must not be Accepted / must compile)`, stub.failures.slice(0, 1));
        }

        const wrong = await judgeSource(spec, "PYTHON", buildWrongPython(spec));
        note(wrong.verdict !== "Accepted", `PYTHON     wrong sol -> ${wrong.verdict} (must not be Accepted)`);
        // A wrong solution that merely crashes proves little: it should produce genuinely wrong output.
        if (wrong.verdict === "Runtime Error" || wrong.verdict === "Compilation Error") {
            lines.push(`  note wrong solution ends in "${wrong.verdict}" (not a Wrong Answer) - double-check it is not just a typo`);
            wrongNotes.push(spec.slug);
        }

        reports.set(spec.slug, [`${bad ? "FAIL" : "PASS"} ${spec.slug}  [${spec.difficulty}]`, ...lines]);
        if (bad) failed++;
    });

    for (const spec of specs) {
        const report = reports.get(spec.slug) as string[];
        if (report[0].startsWith("FAIL")) console.log(report.join("\n"));
        else console.log(report[0]);
    }

    // The two sample problems that shipped with the admin "Load sample" button use their own
    // hand-written stdin handling, so audit them with the same pipeline.
    if (!only) {
        console.log("\n== legacy sample problems (modules/problems/constant/sample-problem.ts)");
        for (const [name, sample] of Object.entries(SAMPLE_PROBLEMS)) {
            const legacy = { testCases: sample.testCases };
            for (const lang of langs) {
                const reference = await judgeSource(legacy, lang, sample.referenceSolutions[lang]);
                if (reference.verdict !== "Accepted") {
                    fail(`FAIL ${name} ${lang} reference -> ${reference.verdict}\n${reference.failures.join("\n")}`);
                    continue;
                }
                const starter = await judgeSource(legacy, lang, sample.codeSnippets[lang]);
                if (starter.verdict === "Accepted") fail(`FAIL ${name} ${lang} starter code is already Accepted`);
                else console.log(`  ok   ${name.padEnd(7)} ${lang.padEnd(10)} reference Accepted, starter -> ${starter.verdict}`);
            }
        }
    }

    if (wrongNotes.length) {
        console.log(`\nnote: these "wrong" solutions crash instead of answering wrongly: ${wrongNotes.join(", ")}`);
    }
    console.log(`\n${failed === 0 ? "ALL CHECKS PASSED" : `${failed} FAILURE(S)`} - ${specs.length} problem(s) x ${langs.length} language(s)`);
    process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
