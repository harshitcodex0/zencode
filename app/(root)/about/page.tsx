import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Code2, GitBranch, Lightbulb, MessageSquareCode, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <div className="min-h-screen py-32">
            <div className="container mx-auto px-4 max-w-5xl space-y-24">
                
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        Master Coding Through <span className="text-amber-500">Understanding</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        ZenCode is a modern coding platform focused on helping students and developers truly understand algorithms, practice coding problems, and improve their technical problem-solving skills.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link href="/problems">Start Solving <ArrowRight className="ml-2 w-4 h-4" /></Link>
                        </Button>
                    </div>
                </section>

                {/* What is ZenCode? */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">What is ZenCode?</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Solving a coding problem isn't just about getting a green "Accepted" badge. It's about the journey of arriving at that solution.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            At ZenCode, we believe that understanding the inefficiencies of a brute-force approach is the key to discovering the optimal solution. We emphasize time and space complexity analysis so you write code that is not only correct, but highly efficient.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl blur-2xl" />
                        <Card className="relative bg-background/50 backdrop-blur-sm border-white/10">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-500/10 p-3 rounded-full text-red-500"><BrainCircuit className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-semibold">Understand the Problem</h3>
                                        <p className="text-sm text-muted-foreground">Break down the requirements and edge cases.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-amber-500/10 p-3 rounded-full text-amber-500"><GitBranch className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-semibold">Brute Force</h3>
                                        <p className="text-sm text-muted-foreground">Find the simplest, most intuitive solution first.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-500/10 p-3 rounded-full text-green-500"><Lightbulb className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="font-semibold">Optimal Approach</h3>
                                        <p className="text-sm text-muted-foreground">Identify bottlenecks and optimize for complexity.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* What We Provide */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">Platform Features</h2>
                        <p className="text-muted-foreground">Everything you need to become a better developer.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-all duration-200 bg-white/5 dark:bg-black/20">
                            <CardHeader>
                                <Code2 className="w-8 h-8 text-amber-500 mb-2" />
                                <CardTitle>Coding Problems</CardTitle>
                                <CardDescription>A curated collection of problems across varying difficulties and topics.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-md transition-all duration-200 bg-white/5 dark:bg-black/20">
                            <CardHeader>
                                <MessageSquareCode className="w-8 h-8 text-blue-500 mb-2" />
                                <CardTitle>AI Coding Assistant</CardTitle>
                                <CardDescription>Your personal tutor for debugging, hints, and understanding optimal approaches.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-md transition-all duration-200 bg-white/5 dark:bg-black/20">
                            <CardHeader>
                                <Cpu className="w-8 h-8 text-purple-500 mb-2" />
                                <CardTitle>Complexity Analysis</CardTitle>
                                <CardDescription>Learn to evaluate your code's time and space complexity with confidence.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>

                {/* Learning Philosophy Quote */}
                <section className="py-12 text-center">
                    <blockquote className="text-2xl md:text-3xl font-medium italic text-muted-foreground leading-relaxed">
                        "Don't just memorize solutions. <br />
                        <span className="text-foreground not-italic font-bold">Understand how to arrive at them.</span>"
                    </blockquote>
                </section>

                {/* Final CTA */}
                <section className="text-center py-16 px-6 bg-amber-500/10 dark:bg-amber-500/5 rounded-3xl border border-amber-500/20 space-y-6">
                    <h2 className="text-3xl font-bold">Ready to solve your next problem?</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Put your algorithmic thinking to the test and start practicing today.
                    </p>
                    <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white mt-4">
                        <Link href="/problems">Go to Problems</Link>
                    </Button>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;
