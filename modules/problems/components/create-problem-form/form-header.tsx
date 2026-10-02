"use client";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getBankSampleGroups } from "@/modules/problems/problem-bank";

export function FormHeader({ sampleType, setSampleType, onLoadSample }: { sampleType: string; setSampleType: (val: string) => void; onLoadSample: () => void }) {
    return (
        <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-3xl flex items-center gap-3">
                    <FileText className="w-8 h-8 text-amber-600" />
                    Create Problem
                </CardTitle>

                <div className="flex flex-col md:flex-row gap-3">
                    <SamplePicker
                        sampleType={sampleType}
                        setSampleType={setSampleType}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onLoadSample}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Load Sample
                    </Button>
                </div>
            </div>
        </CardHeader>
    );
}

function SamplePicker({ sampleType, setSampleType }: { sampleType: string; setSampleType: (val: string) => void }) {
    const groups = getBankSampleGroups();

    return (
        <Select value={sampleType} onValueChange={setSampleType}>
            <SelectTrigger size="sm" className="w-full md:w-72">
                <SelectValue placeholder="Choose a sample problem" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Starter samples</SelectLabel>
                    <SelectItem value="DP">Climbing Stairs (DP)</SelectItem>
                    <SelectItem value="string">Valid Palindrome (String)</SelectItem>
                </SelectGroup>
                {groups.map((group) => (
                    <SelectGroup key={group.topic}>
                        <SelectLabel>{group.topic}</SelectLabel>
                        {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                                {option.difficulty ? ` - ${option.difficulty.toLowerCase()}` : ""}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    );
}
