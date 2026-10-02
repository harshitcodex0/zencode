import { buildProblemRecord } from "./builder";
import { arrayProblems } from "./topics/array";
import { doublyLinkedListProblems } from "./topics/doubly-linked-list";
import { graphProblems } from "./topics/graph";
import { linkedListProblems } from "./topics/linked-list";
import { matrixProblems } from "./topics/matrix";
import { queueProblems } from "./topics/queue";
import { slidingWindowProblems } from "./topics/sliding-window";
import { stackProblems } from "./topics/stack";
import { stringProblems } from "./topics/string";
import type { ProblemRecord, ProblemSpec } from "./types";

/** Every problem in the bank, grouped by topic. */
export const PROBLEM_SPECS: ProblemSpec[] = [
    ...stringProblems,
    ...arrayProblems,
    ...matrixProblems,
    ...slidingWindowProblems,
    ...linkedListProblems,
    ...doublyLinkedListProblems,
    ...stackProblems,
    ...queueProblems,
    ...graphProblems,
];

export const buildAllProblemRecords = (): ProblemRecord[] => PROBLEM_SPECS.map(buildProblemRecord);

export interface SampleOption {
    value: string;
    label: string;
    difficulty?: string;
}

/** Bank problems grouped by their primary topic (the first tag), for the admin "Load Sample" picker. */
export const getBankSampleGroups = (): { topic: string; options: SampleOption[] }[] => {
    const groups = new Map<string, SampleOption[]>();
    for (const spec of PROBLEM_SPECS) {
        const topic = spec.tags[0];
        if (!groups.has(topic)) groups.set(topic, []);
        groups.get(topic)?.push({ value: spec.slug, label: spec.title, difficulty: spec.difficulty });
    }
    return Array.from(groups, ([topic, options]) => ({ topic, options }));
};

/** Returns the form-ready record for a bank problem slug, or undefined when the slug is not in the bank. */
export const getBankProblemRecord = (slug: string): ProblemRecord | undefined => {
    const spec = PROBLEM_SPECS.find((s) => s.slug === slug);
    return spec ? buildProblemRecord(spec) : undefined;
};
