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

// Helper to safely Base64 encode strings for UTF-8 compatibility
function toBase64(str: string = ''): string {
    return Buffer.from(str, 'utf-8').toString('base64');
}

// Helper to decode Base64 strings returned by Judge0
function fromBase64(str: string = ''): string {
    return Buffer.from(str, 'base64').toString('utf-8');
}

export async function submitBatch(submissions: any[]) {
    // Base64 encode fields to prevent 400 Bad Request on multiline/special characters
    const encodedSubmissions = submissions.map((sub) => ({
        ...sub,
        source_code: toBase64(sub.source_code),
        stdin: sub.stdin ? toBase64(sub.stdin) : undefined,
        expected_output: sub.expected_output ? toBase64(sub.expected_output) : undefined,
    }));

    const options = {
        method: 'POST',
        url: `https://${API_HOST}/submissions/batch`,
        params: {
            base64_encoded: 'true',
        },
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'Content-Type': 'application/json',
        },
        data: {
            submissions: encodedSubmissions,
        },
    };

    try {
        const { data } = await axios.request(options);
        // Standardizes tokens output to an array of strings
        return data.map((item: { token: string }) => item.token);
    } catch (error: any) {
        console.error('Judge0 submitBatch Error:', error.response?.data || error.message);
        throw new Error(
            typeof error.response?.data === 'string'
                ? error.response.data
                : JSON.stringify(error.response?.data) || 'Failed to submit batch to Judge0'
        );
    }
}

export async function pollBatchResults(tokens: string[], maxRetries = 15, delayMs = 1000) {
    if (!tokens || tokens.length === 0) {
        throw new Error('No submission tokens provided for polling.');
    }

    const tokenString = tokens.join(',');

    const options = {
        method: 'GET',
        url: `https://${API_HOST}/submissions/batch`,
        params: {
            tokens: tokenString,
            base64_encoded: 'true',
            fields: '*',
        },
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'Content-Type': 'application/json',
        },
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { data } = await axios.request(options);
            const results = data.submissions;

            // Check if all submissions are done (Status 1: In Queue, Status 2: Processing)
            const isAllDone = results.every(
                (r: any) => r.status && r.status.id !== 1 && r.status.id !== 2
            );

            if (isAllDone) {
                // Decode base64 outputs back to readable strings
                return results.map((res: any) => ({
                    ...res,
                    stdout: res.stdout ? fromBase64(res.stdout) : null,
                    stderr: res.stderr ? fromBase64(res.stderr) : null,
                    compile_output: res.compile_output ? fromBase64(res.compile_output) : null,
                    message: res.message ? fromBase64(res.message) : null,
                }));
            }
        } catch (error: any) {
            console.error('Judge0 polling error:', error.response?.data || error.message);
        }

        await sleep(delayMs);
    }

    throw new Error('Judge0 batch execution timed out.');
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));