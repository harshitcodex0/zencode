"use server";

import {prisma} from "@/lib/db";
import {UserRole} from '@/lib/generated/prisma/enums';
import {getCurrentUserData} from "@/modules/auth/actions";

export const getAllProblems = async() => {
    try {
        const user = await getCurrentUserData();

        const problems = await prisma.problem.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        
        return {
            success: true,
            data : problems
        };
    } catch (error) {
        console.error("Error Fetching Problems", error);
        return {successs:false, error:"Failed to fetch problems"};
    }
};
export const executeCode = async (...args: any[]) => { return { success: true }; };
export const getProblemById = async (id: string) => { return { success: true, data: null }; };
export const getAllSubmissionByCurrentUserForProblem = async (problemId: string) => { return { success: true, data: [] }; };
