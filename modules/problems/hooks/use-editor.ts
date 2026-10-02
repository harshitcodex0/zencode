"use client";
import { getJudge0languageId } from "@/lib/judge0";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { executeCode } from "../actions";

export function useEditor(problem: any, initialLanguage = "JAVASCRIPT") {
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
    const [code, setCode] = useState("");
    const [isRunning] = useState(false); // "Run" is not implemented yet, only "Submit" executes code
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [executionResponse, setExecutionResponse] = useState<unknown>(null);

    useEffect(() => {
        if (problem?.codeSnippets?.[selectedLanguage]) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCode(problem?.codeSnippets?.[selectedLanguage]);
        }
    }, [selectedLanguage, problem]);

    const handleRun = () => {
        toast.success("This is your assignment");
    };

    const handleSubmit = async () => {
        if (!problem) return;

        try {
            setIsSubmitting(true);
            const language_id = getJudge0languageId(selectedLanguage);

            // Test cases are loaded server-side by problem id; the client never
            // sends (and therefore can never tamper with) expected outputs.
            const res = await executeCode(code, language_id, problem.id);
            setExecutionResponse(res);

            if (!res.success) {
                toast.error(res.error || "Error executing code");
            } else if (res.submission?.status === "Accepted") {
                toast.success("Accepted! All test cases passed");
            } else {
                toast.error(res.submission?.status || "Wrong Answer");
            }
        } catch (error) {
            console.error('Error executing code', error);
            toast.error('Error executing code');
        }
        finally{
            setIsSubmitting(false)
        }
    };

    return {
        selectedLanguage,
        setSelectedLanguage,
        code,
        setCode,
        isRunning,
        isSubmitting,
        executionResponse,
        handleRun,
        handleSubmit,
    };
}