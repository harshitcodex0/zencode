"use server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getLanguageName, pollBatchResults, submitBatch } from "@/lib/judge0";
import { getCurrentUserData } from "@/modules/auth/actions";
import { currentUser } from "@clerk/nextjs/server";
import { success } from "zod";

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
    stdin: string[],
    expected_outputs: string[],
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
    if (!source_code || source_code.length > 10000) {
        return { success: false, error: "Source code exceeds the maximum limit of 10,000 characters." };
    }
    
    if (![91, 92, 93].includes(language_id)) {
        return { success: false, error: "Unsupported language." };
    }

    if (
        !Array.isArray(stdin) ||
        stdin.length === 0 ||
        stdin.length > 50 ||
        !Array.isArray(expected_outputs) ||
        expected_outputs.length !== stdin.length
    ) {
        return { success: false, error: "Invalid or too many test cases (max 50)." };
    }

    // Validate size of individual test cases
    for (const input of stdin) {
        if (typeof input !== "string" || input.length > 5000) {
            return { success: false, error: "A test case input exceeds 5000 characters." };
        }
    }

    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
        base64_encoded: false,
        wait: false,
    }));

    type Judge0Result = {
        token: string;
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        status: { id: number; description: string };
        memory?: number | null;
        time?: string | null;
    };

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

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res: Judge0Result) => res.token);

    const results = await pollBatchResults(tokens);

    let allPassed = true;

    const detailedResults: DetailedResult[] = results.map((result: Judge0Result, i: number) => {
        const stdout = result.stdout?.trim() || null;
        const expected_output = expected_outputs[i]?.trim() ?? "";
        const passed = stdout === expected_output;

        if (!passed) allPassed = false;

        return {
            testCase: i + 1,
            passed,
            stdout,
            expected: expected_output,
            stderr: result.stderr || null,
            compile_output: result.compile_output || null,
            status: result.status.description,
            memory: result.memory ? `${result.memory} KB` : undefined,
            time: result.time ? `${result.time} s` : undefined,
        };
    });

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
            status: allPassed ? "Accepted" : "Wrong Answer",
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