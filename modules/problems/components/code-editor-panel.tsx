import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Code, Send } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import { EDITOR_OPTIONS, getEditorLanguage, LANGUAGE_OPTIONS } from "../constant";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

interface CodeEditorPanelProps {
    code: string;
    onCodeChange: (value: string) => void;
    selectedLanguage: string;
    onLanguageChange: (lang: string) => void;
    onRun: () => void;
    onSubmit: () => void;
    isRunning: boolean;
    isSubmitting: boolean;
}

const CodeEditorPanel = ({
                             code,
                             onCodeChange,
                             selectedLanguage,
                             onLanguageChange,
                             onRun,
                             onSubmit,
                             isRunning,
                             isSubmitting,
                         }: CodeEditorPanelProps) => {
    const { theme } = useTheme();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Code className="size-5" />
                        Code Editor
                    </CardTitle>
                    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Editor
                        height={"400px"}
                        language={getEditorLanguage(selectedLanguage)}
                        value={code}
                        // @ts-expect-error some error
                        onChange={(value:string)=>onCodeChange(value || "")}
                        theme={theme === "dark" ? "vs-dark":"light"}
                        // @ts-expect-error some error
                        options={EDITOR_OPTIONS}
                    />
                </div>

                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={onRun}
                        disabled={isRunning}
                        variant={"outline"}
                        className="flex items-center gap-2"
                    >
                        {isRunning ? "Running..." : "Run"}
                    </Button>

                    <Button
                        variant={"default"}
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CodeEditorPanel;