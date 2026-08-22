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

        if (!user || 'success' in user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
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

        if (title && title.length > 200) {
            return NextResponse.json({ error: "Title is too long (max 200)." }, { status: 400 });
        }
        if (description && description.length > 20000) {
            return NextResponse.json({ error: "Description is too long (max 20000)." }, { status: 400 });
        }

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
                source_code: String(solutionCode),
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            // 3. Submit all test cases in one batch
            const rawResults = await submitBatch(submissions);

            // 4. Safely extract tokens (handles both string array and object array)
            const tokens: string[] = Array.isArray(rawResults)
                ? rawResults.map((res: { token?: string } | string) => (typeof res === "string" ? res : res.token)).filter((t): t is string => Boolean(t))
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
    } catch (error: unknown) {
        console.error("Database or Judge0 error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save problems to database" },
            { status: 500 },
        );
    }
}