"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type TestCase = {
    id: string;
    testCase: number;
    passed: boolean;
    stdout?: string | null;
    expected?: string | null;
    stderr?: string | null;
    status: string;
    memory?: string | null;
    time?: string | null;
};

export const TestCaseTable = ({ testCases }: { testCases: TestCase[] }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    if (!testCases || testCases.length === 0) return null;

    const passed = testCases.filter(tc => tc.passed).length;
    const total = testCases.length;

    return (
        <div className="space-y-2">
            {/* Summary bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="font-medium">Test Cases</span>
                <span className={passed === total ? "text-green-500 font-semibold" : "text-red-400 font-semibold"}>
                    {passed}/{total} passed
                </span>
            </div>

            {/* Test case rows */}
            <div className="rounded-lg border divide-y overflow-hidden">
                {testCases.map((tc, index) => (
                    <div key={tc.id}>
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        >
                            {tc.passed
                                ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                            }
                            <span className="text-sm font-medium flex-1">Test Case {index + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${tc.passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}>
                                {tc.passed ? "Passed" : "Failed"}
                            </span>
                            {tc.time && <span className="text-xs text-muted-foreground ml-1">{tc.time}</span>}
                            {expandedIndex === index
                                ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            }
                        </button>

                        {expandedIndex === index && (
                            <div className="px-3 pb-3 pt-1 bg-muted/30 space-y-2 text-xs border-t">
                                {tc.stdout !== null && tc.stdout !== undefined && (
                                    <div>
                                        <p className="text-muted-foreground mb-0.5 font-medium">Output</p>
                                        <pre className="bg-background rounded p-2 font-mono whitespace-pre-wrap break-words border">{tc.stdout || "(empty)"}</pre>
                                    </div>
                                )}
                                {tc.expected && (
                                    <div>
                                        <p className="text-muted-foreground mb-0.5 font-medium">Expected</p>
                                        <pre className="bg-background rounded p-2 font-mono whitespace-pre-wrap break-words border">{tc.expected}</pre>
                                    </div>
                                )}
                                {tc.stderr && (
                                    <div>
                                        <p className="text-red-400 mb-0.5 font-medium">Stderr</p>
                                        <pre className="bg-red-950/20 border border-red-900/30 rounded p-2 font-mono text-red-300 whitespace-pre-wrap break-words">{tc.stderr}</pre>
                                    </div>
                                )}
                                {tc.memory && (
                                    <p className="text-muted-foreground">Memory: {tc.memory}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};