import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import {
    getJudge0languageId,
    pollBatchResults,
    submitBatch,
} from "@/lib/judge0";
import { currentUserRole, getCurrentUserData } from "@/modules/auth/actions";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const userRole = await currentUserRole();
        const user = await getCurrentUserData();

        if (!user) {
            return NextResponse.json({ error: "User not found" });
        }

        if (userRole !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testCases,
            codeSnippets,
            referenceSolutions,
        } = await request.json();

        if (
            !title ||
            !description ||
            !difficulty ||
            !testCases ||
            !codeSnippets ||
            !referenceSolutions
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return NextResponse.json(
                { error: "At least one test case is required" },
                { status: 400 },
            );
        }

        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            // 1. Get judge0 language id for current lang
            const languageId = getJudge0languageId(language);

            // 2. Prepare judge0 submissions for all test cases
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            // 3. Submit all test cases in one batch
            const rawResults = await submitBatch(submissions);

            // 4. Safely extract tokens (handles both string array and object array)
            const tokens: string[] = Array.isArray(rawResults)
                ? rawResults.map((res: any) => (typeof res === "string" ? res : res.token)).filter(Boolean)
                : [];

            if (tokens.length === 0) {
                return NextResponse.json(
                    { error: `Failed to retrieve execution tokens from Judge0 for ${language}` },
                    { status: 500 }
                );
            }

            // 5. Poll judge0 until all submissions are done
            const results = await pollBatchResults(tokens);

            // 6. Validate each test case (Status ID 3 = Accepted)
            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (result.status.id !== 3) {
                    return NextResponse.json(
                        {
                            error: `Validation failed for ${language}`,
                            testCase: {
                                input: submissions[i].stdin,
                                expectedOutput: submissions[i].expected_output,
                                actualOutput: result.stdout,
                                error: result.stderr || result.compile_output || result.message,
                            },
                            details: result,
                        },
                        { status: 400 },
                    );
                }
            }
        }

        const newProblem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testCases,
                codeSnippets,
                referenceSolutions,
                // @ts-ignore
                userId: user.id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Problem Created Successfully",
                data: newProblem,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("Database or Judge0 error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save problem to database" },
            { status: 500 },
        );
    }
}