"use server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getLanguageName, pollBatchResults, submitBatch } from "@/lib/judge0";
import { Judge0Result, judgeTestCase, parseStoredTestCases, summarizeVerdict } from "@/lib/judging";
import { getCurrentUserData } from "@/modules/auth/actions";
import { currentUser } from "@clerk/nextjs/server";

export const getAllProblems = async () => {
    try {
        const user = await getCurrentUserData();

        const problems = await prisma.problem.findMany({
            include:{
                solvedBy:true
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: problems,
        };
    } catch (error) {
        console.error("❌ Error fetching problems:", error);
        return { success: false, error: "Failed to fetch problems" };
    }
};

export const getProblemById = async (id: string) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: {
                id: id,
            },
        });

        return {
            success: true,
            data: problem,
        };
    } catch (error) {
        console.error("❌ Error fetching problem:", error);
        return { success: false, error: "Failed to fetch problem" };
    }
};

import { checkRateLimit } from "@/lib/ratelimit";

export const executeCode = async (
    source_code: string,
    language_id: number,
    id: string,
) => {
    const user = await getCurrentUserData();

    if (!user || 'success' in user) {
        return { success: false, error: "User not found" };
    }

    // Rate Limiting: 10 executions per minute
    const isAllowed = await checkRateLimit(user.id, "CODE_EXECUTION", 10, 60000);
    if (!isAllowed) {
        return { success: false, error: "Too many submissions. Please wait a minute." };
    }

    // Payload Validation
    if (typeof source_code !== "string" || !source_code.trim() || source_code.length > 10000) {
        return { success: false, error: "Source code is empty or exceeds the maximum limit of 10,000 characters." };
    }

    if (![91, 92, 93].includes(language_id)) {
        return { success: false, error: "Unsupported language." };
    }

    // The test cases (inputs AND expected outputs) are always read from the
    // database. They must never be accepted from the client: otherwise anyone
    // could submit their own "expected output" and get any code accepted.
    const problem = await prisma.problem.findUnique({
        where: { id },
        select: { testCases: true },
    });

    if (!problem) {
        return { success: false, error: "Problem not found" };
    }

    const testCases = parseStoredTestCases(problem.testCases);
    if (!testCases || testCases.length > 50) {
        return { success: false, error: "This problem has no valid test cases." };
    }

    const stdin = testCases.map((tc) => tc.input);
    const expected_outputs = testCases.map((tc) => tc.output);

    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
        base64_encoded: false,
        wait: false,
    }));

    type DetailedResult = {
        testCase: number;
        passed: boolean;
        stdout: string | null;
        expected: string;
        stderr: string | null;
        compile_output: string | null;
        status: string;
        memory: string | undefined;
        time: string | undefined;
    };

    let results: Judge0Result[];
    try {
        const submitResponse = await submitBatch(submissions);

        if (!Array.isArray(submitResponse) || submitResponse.length !== submissions.length) {
            console.error("Unexpected Judge0 batch response:", submitResponse);
            return { success: false, error: "Code execution service rejected the submission. Please try again." };
        }

        const tokens = submitResponse.map((res: Judge0Result) => res.token as string);
        results = await pollBatchResults(tokens);
    } catch (error) {
        console.error("Judge0 execution failed:", error);
        return { success: false, error: "Code execution service is unavailable. Please try again." };
    }

    const verdicts = results.map((result, i) => judgeTestCase(result, expected_outputs[i] ?? ""));
    const allPassed = verdicts.length === testCases.length && verdicts.every((v) => v.passed);
    const overallStatus = summarizeVerdict(results, verdicts);

    const detailedResults: DetailedResult[] = results.map((result, i) => ({
        testCase: i + 1,
        passed: verdicts[i].passed,
        stdout: verdicts[i].stdout,
        expected: verdicts[i].expected,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: verdicts[i].status,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
    }));

    const submission = await prisma.submission.create({
        data: {
            userId: user.id,
            problemId: id,
            sourceCode: source_code,
            language: getLanguageName(language_id),
            stdin: stdin.join("\n"),
            stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
            stderr: detailedResults.some((r) => r.stderr)
                ? JSON.stringify(detailedResults.map((r) => r.stderr))
                : null,
            compileOutput: detailedResults.some((r) => r.compile_output)
                ? JSON.stringify(detailedResults.map((r) => r.compile_output))
                : null,
            status: overallStatus,
            memory: detailedResults.some((r) => r.memory)
                ? JSON.stringify(detailedResults.map((r) => r.memory))
                : null,
            time: detailedResults.some((r) => r.time)
                ? JSON.stringify(detailedResults.map((r) => r.time))
                : null,
        },
    });

    if (allPassed) {
        await prisma.problemSolved.upsert({
            where: {
                userId_problemId: { userId: user.id, problemId: id },
            },

            update: {},
            create: {
                userId: user.id,
                problemId: id,
            },
        });
    }

    const testCaseResults = detailedResults.map((result) => ({
        submissionId: submission.id,
        testCase: result.testCase,
        passed: result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        status: result.status,
        memory: result.memory,
        time: result.time,
    }));

    await prisma.testCaseResult.createMany({ data: testCaseResults });

    const submissionWithTestCases = await prisma.submission.findUnique({
        where: { id: submission.id },
        include: {
            testCases: true,
        },
    });

    return {
        success: true,
        submission: submissionWithTestCases,
    };
};

export const getAllSubmissionByCurrentUserForProblem = async (
    problemId: string,
) => {
    const user = await getCurrentUserData();

    if (!user || 'success' in user) {
        return { success: false, data: [] };
    }

    const submissions = await prisma.submission.findMany({
        where: {
            problemId: problemId,
            userId: user.id,
        },
    });

    return {
        success: true,
        data: submissions,
    };
};