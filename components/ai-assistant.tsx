"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, TerminalSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

const SUGGESTED_PROMPTS = [
    "Explain binary search",
    "Give brute force and optimal approaches for Two Sum",
    "Why does my recursion code fail?",
    "Explain time complexity of merge sort"
];

export const AIAssistant = ({ problemContext }: { problemContext?: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: content.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

        try {
            // We only send the last 10 messages to avoid huge payloads, plus the new one
            const recentMessages = [...messages.slice(-9), userMsg].filter(m => m.content);
            
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: recentMessages,
                    problemContext 
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to get response');
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; 
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        if (line.trim() === 'data: [DONE]') continue;
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            if (parsed.choices?.[0]?.delta?.content) {
                                aiText += parsed.choices[0].delta.content;
                                setMessages(prev => 
                                    prev.map(msg => 
                                        msg.id === aiMsgId ? { ...msg, content: aiText } : msg
                                    )
                                );
                            }
                        } catch (e) {
                            // ignore JSON parse errors for incomplete data
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("AI Error:", error);
            toast.error(error.message || "Failed to communicate with AI.");
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last.id === aiMsgId && !last.content) {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputValue);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 rounded-full shadow-xl bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 transition-transform duration-200 border-2 border-amber-300/30 flex items-center justify-center group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 blur-md group-hover:opacity-100 opacity-0 transition-opacity" />
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </Button>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[450px] h-[600px] max-h-[85vh] shadow-2xl flex flex-col border border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <div className="bg-amber-500/20 p-2 rounded-lg">
                                <Bot className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">ZenCode AI</CardTitle>
                                <p className="text-xs text-muted-foreground">Coding & Study Assistant</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-full px-4 py-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-12">
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                                        <TerminalSquare className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">How can I help you?</h3>
                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                            Ask me about algorithms, data structures, or drop a code snippet to debug.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(prompt)}
                                                className="text-xs bg-muted hover:bg-amber-500/10 hover:text-amber-600 transition-colors px-3 py-2 rounded-full border"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-4 w-full overflow-x-hidden">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                                                    <Bot className="w-4 h-4 text-amber-600" />
                                                </div>
                                            )}
                                            <div
                                                className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm min-w-0 ${
                                                    msg.role === 'user'
                                                        ? 'bg-amber-500 text-white rounded-tr-sm'
                                                        : 'bg-muted rounded-tl-sm border'
                                                }`}
                                            >
                                                {msg.role === 'user' ? (
                                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                                ) : (
                                                    !msg.content ? (
                                                        <div className="flex items-center gap-2 text-muted-foreground h-5">
                                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                                            <span className="text-xs">Thinking...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 max-w-full break-words prose-pre:overflow-x-auto">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                    
                    <CardFooter className="p-3 border-t bg-background">
                        <div className="flex gap-2 w-full items-end relative bg-muted rounded-xl p-1 border focus-within:ring-1 focus-within:ring-amber-500 transition-shadow">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a coding question..."
                                className="w-full min-h-[44px] max-h-[120px] bg-transparent resize-none focus:outline-none text-sm py-3 px-3 scrollbar-hide"
                                rows={1}
                            />
                            <Button
                                size="icon"
                                className={`h-8 w-8 shrink-0 rounded-lg mb-1 mr-1 transition-all ${
                                    inputValue.trim() ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-transparent text-muted-foreground hover:bg-transparent'
                                }`}
                                onClick={() => handleSend(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </>
    );
};
