import axios from 'axios';

const API_KEY = process.env.JUDGE0_API_KEY;
const API_HOST = 'judge0-ce.p.rapidapi.com';

export function getJudge0languageId(language: string): number {
    const languageMap: Record<string, number> = {
        PYTHON: 92,
        JAVASCRIPT: 93,
        JAVA: 91,
    };

    const id = languageMap[language.toUpperCase()];
    if (!id) {
        throw new Error(`Unsupported or missing language: ${language}`);
    }

    return id;
}

export function getLanguageName(languageId:number) {
    const LANGUAGE_NAMES = {
        93: "JavaScript",
        92: "Python",
        91: "Java",
    };
    return LANGUAGE_NAMES[languageId as keyof typeof LANGUAGE_NAMES] || "Unknown";
}


// Helper to safely Base64 encode strings for UTF-8 compatibility
function toBase64(str: string = ''): string {
    return Buffer.from(str, 'utf-8').toString('base64');
}

// Helper to decode Base64 strings returned by Judge0
function fromBase64(str: string = ''): string {
    return Buffer.from(str, 'base64').toString('utf-8');
}



export interface SubmissionPayload {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
}

export async function submitBatch(submissions: SubmissionPayload[]) {
    const options = {
        method: "POST",
        url: `https://${API_HOST}/submissions/batch`,
        params: {
            base64_encoded: "false",
        },
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'Content-Type': 'application/json'
        },
        data: {
            submissions: submissions,
        },
    };

    const { data } = await axios.request(options);

    return data;
}



export async function pollBatchResults(tokens: string[]) {
    let retries = 0;
    const MAX_RETRIES = 30; // 30 seconds max timeout

    while (retries < MAX_RETRIES) {
        const options = {
            method: "GET",
            url: `https://${API_HOST}/submissions/batch`,
            params: {
                tokens: tokens.join(","),
                base64_encoded: "false",
                fields: "*",
            },
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
                'Content-Type': 'application/json'
            },
        };

        const { data } = await axios.request(options);

        const results = data.submissions;

        const isAllDone = results.every(
            (r: { status: { id: number } }) => r.status.id !== 1 && r.status.id !== 2
        );

        if(isAllDone) return results;

        await sleep(1000);
        retries++;
    }

    throw new Error("Judge0 execution timed out after 30 seconds.");
}




export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));