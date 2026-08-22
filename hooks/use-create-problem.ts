"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { defaultFormValues, problemSchema } from "@/modules/problems/schema";
import { SAMPLE_PROBLEMS } from "@/modules/problems/constant/sample-problem";
import { z } from "zod";

type ProblemFormData = z.infer<typeof problemSchema>;

export function useCreateProblem() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sampleType, setSampleType] = useState("DP");

    const form = useForm<ProblemFormData>({
        resolver: zodResolver(problemSchema),
        defaultValues: defaultFormValues as ProblemFormData,
    });

    const testCasesArray = useFieldArray({
        control: form.control,
        name: "testCases" as const,
    });

    const tagsArray = useFieldArray({
        control: form.control,
        name: "tags" as const,
    });

    const onSubmit = async (values: ProblemFormData) => {
        try {
            setIsLoading(true);
            // tags are stored as { value: string }[] in the form for useFieldArray compatibility
            // map them back to plain strings before sending to the API
            const payload = {
                ...values,
                tags: values.tags.map((t) => t.value),
            };
            const response = await fetch("/api/create-problem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log(data);
            if (data.success) {
                toast.success("Problem created successfully");
                router.push("/problems");
            }
        } catch (error) {
            console.error("Error creating problems:", error);
            // @ts-expect-error Error type is unknown but might have message
            toast.error(error?.message || "Failed to create problems");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSampleData = () => {
        const sampleData =
            SAMPLE_PROBLEMS[sampleType as keyof typeof SAMPLE_PROBLEMS];
        // Sample data has tags as string[], convert to object shape for useFieldArray
        const tagsAsObjects = (sampleData.tags as string[]).map((t: string) => ({ value: t }));
        tagsArray.replace(tagsAsObjects);
        testCasesArray.replace(sampleData.testCases);

        form.reset({ ...sampleData, tags: tagsAsObjects } as unknown as ProblemFormData);
    };

    return {
        form,
        testCasesArray,
        tagsArray,
        isLoading,
        sampleType,
        setSampleType,
        onSubmit: form.handleSubmit(onSubmit),
        loadSampleData,
    };
}