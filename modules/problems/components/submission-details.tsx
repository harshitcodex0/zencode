import { Badge } from "@/components/ui/badge";
import { Clock, CpuIcon, Code, CheckCircle2, XCircle } from "lucide-react";

type Submission = {
    status: string;
    createdAt: string | Date;
    language: string;
    memory?: string | null;
    time?: string | null;
};

export const SubmissionDetails = ({ submission }: { submission: Submission }) => {
    const isSuccess = submission.status === "Accepted";

    const averageMemory = (() => {
        try {
            if (!submission.memory) return null;
            const arr: string[] = JSON.parse(submission.memory);
            const avg = arr.reduce((a, b) => a + parseFloat(b), 0) / arr.length;
            return `${avg.toFixed(1)} KB`;
        } catch { return null; }
    })();

    const averageTime = (() => {
        try {
            if (!submission.time) return null;
            const arr: string[] = JSON.parse(submission.time);
            const avg = arr.map(t => parseFloat(t.replace(" s", ""))).reduce((a, b) => a + b, 0) / arr.length;
            return `${avg.toFixed(3)} s`;
        } catch { return null; }
    })();

    return (
        <div className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-4 flex-wrap ${
            isSuccess ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
        }`}>
            {/* Status badge */}
            <div className="flex items-center gap-2">
                {isSuccess
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-400" />
                }
                <span className={`font-semibold text-sm ${isSuccess ? "text-green-500" : "text-red-400"}`}>
                    {submission.status}
                </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    <span>{submission.language}</span>
                </div>
                {averageTime && (
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{averageTime}</span>
                    </div>
                )}
                {averageMemory && (
                    <div className="flex items-center gap-1.5">
                        <CpuIcon className="h-3.5 w-3.5" />
                        <span>{averageMemory}</span>
                    </div>
                )}
                <span className="text-muted-foreground/60">
                    {new Date(submission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
        </div>
    );
};