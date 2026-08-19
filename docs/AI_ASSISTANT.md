# ZenCode AI Coding & Study Assistant

## 1. Architecture
The AI Assistant follows a secure client-server architecture:
`Frontend (Chat UI) → Backend API (/api/assistant) → OpenRouter → AI Model → Backend → Frontend`

This ensures that the OpenRouter API key remains securely on the server and is never exposed to the client-side code.

## 2. Environment Variables
The following environment variables must be placed in a `.env` file at the root of the project:

```env
# OpenRouter AI Assistant
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=google/gemini-2.5-flash
```

**IMPORTANT**: 
- **DO NOT** prefix `OPENROUTER_API_KEY` with `NEXT_PUBLIC_`. It must remain a server-side secret.
- **DO NOT** commit your `.env` file to version control.
- See `.env.example` for a complete reference.

## 3. OpenRouter Setup
1. Go to [OpenRouter.ai](https://openrouter.ai/) and sign up.
2. Navigate to "Keys" and create a new API key.
3. Copy the key and place it in your `.env` file as `OPENROUTER_API_KEY`.
4. Ensure you have credits if you are using paid models. Free models (like `mistralai/mistral-7b-instruct:free`) are also available.

## 4. Model Configuration
You can change the AI model without touching the code. Simply change the `OPENROUTER_MODEL` variable in your `.env` file to any model supported by OpenRouter (e.g., `openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet`). If left empty, it defaults to `google/gemini-2.5-flash`.

## 5. System Prompt
The system prompt controls the AI's persona, teaching methodology, and scope. It is located inside `app/api/assistant/route.ts`. 

## 6. Assistant Scope
The assistant is heavily restricted via the system prompt to **only answer questions related to programming, computer science, and studying**. If a user asks about politics, recipes, or other unrelated topics, it is instructed to politely refuse and redirect the conversation back to coding.

## 7. Brute Force / Optimal Behavior
The AI is instructed to follow the ZenCode teaching philosophy: **Understand → Brute Force → Find Bottleneck → Optimize → Complexity**. When a user asks about an algorithmic problem, the AI will first explain the brute force approach and its inefficiency before presenting the optimal solution.

## 8. Chat Context
The chat history is currently stored in the client-side state of the `AIAssistant` component. When a new message is sent, the last 10 messages (including the new one) are sent to the backend. This provides enough context for follow-up questions while preventing unnecessarily huge payloads that would consume excessive API tokens.

## 9. Security
- The OpenRouter API key is only accessed inside `app/api/assistant/route.ts` (a server-side endpoint).
- Client requests are sent to `/api/assistant`, which then proxies them to OpenRouter.
- The system prompt instructs the AI not to reveal its prompt or internal configurations.

## 10. Troubleshooting

- **AI doesn't respond or throws 500 error**: Make sure `OPENROUTER_API_KEY` is set in your `.env` file and restart your Next.js server (`npm run dev`).
- **"Failed to communicate with AI model"**: Your OpenRouter API key might be invalid, or you might be out of credits.
- **Next.js hydration errors**: Make sure your `.env` variables do not have accidental spaces.
- **Missing packages**: If you encounter errors about `react-markdown` or `remark-gfm`, run `npm install react-markdown remark-gfm --legacy-peer-deps`.
