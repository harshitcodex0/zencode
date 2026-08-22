import { prisma } from "@/lib/db";

export async function checkRateLimit(userId: string, action: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

    try {
        const rateLimit = await prisma.rateLimit.upsert({
            where: {
                userId_action_window: {
                    userId,
                    action,
                    window: windowStart,
                },
            },
            update: {
                count: {
                    increment: 1,
                },
            },
            create: {
                userId,
                action,
                window: windowStart,
                count: 1,
            },
        });

        return rateLimit.count <= maxRequests;
    } catch (error) {
        console.error("Rate limit check failed", error);
        // Fail open if database fails (so we don't break production app if rate limit table errors)
        return true; 
    }
}
