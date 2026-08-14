import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import OpenAI from 'openai';
import { saveAnalysis } from '@/lib/db';

// Data Imports
import principlesText from '../Data/40principles.md?raw';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

/**
 * Cloudflare bindings reachable from an Astro action context.
 * `runtime` is injected by @astrojs/cloudflare; it is absent under `astro dev`.
 */
type CloudflareEnv = {
    DEEPSEEK_API_KEY?: string;
    DB?: import('@cloudflare/workers-types').D1Database;
};

function getEnv(locals: App.Locals): CloudflareEnv {
    return (locals as any)?.runtime?.env ?? {};
}

/**
 * Resolves the DeepSeek API key from the Worker secret, falling back to the
 * build-time env var so `astro dev` keeps working locally.
 */
function getApiKey(locals: App.Locals): string {
    const apiKey = getEnv(locals).DEEPSEEK_API_KEY ?? import.meta.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        throw new Error(
            "DEEPSEEK_API_KEY is not configured. Set it with `wrangler secret put DEEPSEEK_API_KEY` in production, or in .env for local development."
        );
    }

    return apiKey;
}

function createClient(locals: App.Locals): OpenAI {
    return new OpenAI({
        baseURL: DEEPSEEK_BASE_URL,
        apiKey: getApiKey(locals),
    });
}

type ChatMessage = { role: 'system' | 'user'; content: string };

/**
 * Calls DeepSeek with thinking mode enabled. If the request fails with the
 * JSON response format (not every reasoning model supports it), it retries
 * once without it and relies on safeParseJSON to clean the output.
 */
async function callDeepSeek(
    client: OpenAI,
    messages: ChatMessage[],
    options: { json?: boolean } = {}
): Promise<string> {
    const baseParams: Record<string, unknown> = {
        model: DEEPSEEK_MODEL,
        messages,
        thinking: { type: 'enabled' },
        reasoning_effort: 'high',
        stream: false,
    };

    const params = options.json
        ? { ...baseParams, response_format: { type: 'json_object' } }
        : baseParams;

    try {
        const completion = await client.chat.completions.create(params as any);
        return (completion as any).choices?.[0]?.message?.content ?? '';
    } catch (error) {
        if (!options.json) throw error;
        console.error('DeepSeek JSON-mode call failed, retrying without response_format:', error);
        const completion = await client.chat.completions.create(baseParams as any);
        return (completion as any).choices?.[0]?.message?.content ?? '';
    }
}

/**
 * Safely parses JSON from a string, handling Markdown code blocks.
 */
function safeParseJSON(text: string): any {
    if (!text) return {};
    try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
        // Also handle generic code blocks
        cleanText = cleanText.replace(/```\n?|\n?```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        return {};
    }
}

export const server = {
    translateToEnglish: defineAction({
        input: z.object({
            text: z.string(),
        }),
        handler: async ({ text }, context) => {
            if (!text || text.trim() === "") return "";
            try {
                const client = createClient(context.locals);
                const result = await callDeepSeek(client, [
                    {
                        role: 'system',
                        content: 'You are a precise translator. Translate the user\'s text to English. If it is already in English, return it as is. Return ONLY the translated text, no explanations or markdown.',
                    },
                    { role: 'user', content: text },
                ]);
                return result.trim() || text;
            } catch (error) {
                console.error("Translation error:", error);
                return text;
            }
        }
    }),

    solveTrizProblem: defineAction({
        input: z.object({
            situation: z.string(),
            lang: z.enum(['en', 'vi']).default('en'),
            constraints: z.object({
                budget: z.number().default(50),
                time: z.number().default(50),
                risk: z.number().default(50),
            }).optional(),
        }),
        handler: async ({ situation, lang, constraints }, context) => {
            if (!situation || situation.trim() === "") {
                return { error: lang === 'vi' ? "Vui lòng nhập vấn đề." : "Please enter a problem." };
            }
            try {
                const client = createClient(context.locals);

                let constraintContext = "";
                if (constraints) {
                    constraintContext = `
                    User Constraints (0-100 scale):
                    - Budget: ${constraints.budget}% (Low=Constrained, High=Flexible)
                    - Time: ${constraints.time}% (Low=LongTerm, High=Urgent)
                    - Risk: ${constraints.risk}% (Low=Safe, High=Experimental)
                    Consider these when generating solutions.`;
                }

                const systemPrompt = `
                You are a world-class TRIZ expert (Theory of Inventive Problem Solving), trained in the tradition of Genrich Altshuller.
                You analyze real-world problems rigorously: define the Ideal Final Result, expose the underlying contradiction, map it to the standard TRIZ parameters, and derive inventive solutions from the 40 Principles.
                You always return a SINGLE valid JSON object exactly matching the schema the user provides. No markdown, no commentary outside the JSON.

                Reference Context (TRIZ 40 Principles):
                ${principlesText}`;

                const userPrompt = `
                Perform a complete TRIZ analysis on the following situation:
                "${situation}"

                Language: The values in your JSON response MUST be written in ${lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.

                ${constraintContext}

                Perform the following steps and return a SINGLE JSON object matching the schema below:

                Step 1: Validation
                Check if the input describes a valid problem. If not, set "isValid" to false and provide a "message".

                Step 2: Goal Definition (Ideal Final Result)
                Define the IFR. Provide a summary and estimate metrics (cost, durability, deployment) and operational delta (current vs ideal state 0-100).

                Step 3: Problem Formulation
                Formulate a clear contradiction statement based on the IFR.

                Step 4: Contradiction Analysis
                Identify the Improving Parameter and Worsening Parameter from the standard TRIZ 39 Parameters.
                Map them to standard IDs (1-39).
                Suggest relevant Inventive Principles (IDs from 1-40) based on the contradiction or your expert knowledge.

                Step 5: Solution Generation
                Generate 3 specific, actionable solution concepts based on the principles and constraints.

                Step 6: Evaluation
                Select the best solution and create a short implementation plan.

                JSON Schema:
                {
                    "validation": { "isValid": boolean, "message": string },
                    "result": {
                        "translatedSituation": "${situation}",
                        "goal": {
                            "summary": string,
                            "metrics": { "logistics_cost": string (%), "durability": string (%), "deployment": string (days) },
                            "operational_delta": { "current_state": number[], "ideal_state": number[] }
                        },
                        "problem": string,
                        "contradiction": {
                            "improvingParameter": { "ID": number, "Name": string },
                            "worseningParameter": { "ID": number, "Name": string },
                            "principles": [ { "id": number, "name": string } ]
                        },
                        "solutions": [ { "title": string, "description": string, "principles": string } ],
                        "evaluation": {
                            "bestSolution": string,
                            "bestSolutionReason": string,
                            "feasibility": string,
                            "valueContribution": string,
                            "costs": { "human": string, "time": string, "money": string },
                            "implementationPlan": string[]
                        }
                    }
                }
                IMPORTANT: Return ONLY valid JSON. No Markdown.`;

                const rawText = await callDeepSeek(
                    client,
                    [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    { json: true }
                );

                console.log("--- RAW LLM RESPONSE START ---");
                console.log(rawText);
                console.log("--- RAW LLM RESPONSE END ---");

                const parsed = safeParseJSON(rawText || "{}");
                console.log("--- PARSED JSON ---", JSON.stringify(parsed, null, 2));

                // Check Validation
                if (parsed.validation && !parsed.validation.isValid) {
                    console.log("Validation Failed:", parsed.validation.message);
                    throw new Error(parsed.validation.message);
                }

                // If valid, return the full result object
                // We need to flatten/adapt it to match FullTrizResult if needed, or update the UI to match this structure.
                // The prompt structure "result" maps closely to FullTrizResult, but "goal" in FullTrizResult is string, here it's object (from analyzeGoal).
                // Let's adapt it to return the exact FullTrizResult structure expected by the UI.

                const res = parsed.result;

                // Normalize Contradiction to handle LLM casing inconsistencies (Name vs name, ID vs id) and snake_case
                let normalizedContradiction = null;
                const rawCon = res.contradiction;

                if (rawCon) {
                    const imp = rawCon.improvingParameter || rawCon.improving_parameter || rawCon.ImprovingParameter;
                    const wor = rawCon.worseningParameter || rawCon.worsening_parameter || rawCon.WorseningParameter;

                    if (imp && wor) {
                        normalizedContradiction = {
                            improvingParameter: {
                                ID: imp.ID || imp.id,
                                Name: imp.Name || imp.name,
                                Description: imp.Description || imp.description,
                                Keyword: imp.Keyword || imp.keyword
                            },
                            worseningParameter: {
                                ID: wor.ID || wor.id,
                                Name: wor.Name || wor.name,
                                Description: wor.Description || wor.description,
                                Keyword: wor.Keyword || wor.keyword
                            },
                            principles: rawCon.principles || []
                        };
                    } else {
                        console.warn("Contradiction extraction failed: Missing improving/worsening parameters in", rawCon);
                    }
                }

                const fullResult = {
                    translatedSituation: situation,
                    goal: res.goal, // Pass object directly. UI types now support it.
                    problem: res.problem,
                    contradiction: normalizedContradiction,
                    solutions: res.solutions,
                    evaluation: res.evaluation
                };

                // Save to Database (best-effort: never blocks the response on a write failure)
                await saveAnalysis(getEnv(context.locals).DB, situation, lang, constraints, fullResult);

                // Return directly, don't wrap in { data: ... }
                return fullResult;

            } catch (error: any) {
                console.error("Unified Analysis Error:", error);
                throw new Error(error.message || "An unexpected error occurred.");
            }
        }
    })
};
