import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs/promises';
import path from 'path';
import { saveAnalysis } from '@/lib/db';

// Data Imports
import matrixRaw from '../Data/Matrix2010.csv?raw';
import principlesText from '../Data/40principles.md?raw';

// Utility to get API Key
const API_KEY_PATH = path.join(process.cwd(), 'apikey.txt');
async function getApiKey(): Promise<string> {
    try {
        const apiKey = await fs.readFile(API_KEY_PATH, 'utf-8');
        return apiKey.trim();
    } catch (error) {
        console.error("Error reading API key:", error);
        throw new Error("Failed to read API key. Please ensure apikey.txt exists in the project root.");
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
        handler: async ({ text }) => {
            if (!text || text.trim() === "") return "";
            try {
                const apiKey = await getApiKey();
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                    model: "gemini-3-pro-preview",
                    contents: `Translate the following text to English. If it is already in English, return it as is. Return ONLY the translated text, no explanations or markdown.\n\nText: "${text}"`,
                });
                return response.text || "";
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
        handler: async ({ situation, lang, constraints }) => {
            if (!situation || situation.trim() === "") {
                return { error: lang === 'vi' ? "Vui lòng nhập vấn đề." : "Please enter a problem." };
            }
            try {
                const apiKey = await getApiKey();
                const ai = new GoogleGenAI({ apiKey });

                let constraintContext = "";
                if (constraints) {
                    constraintContext = `
                    Users Constraints (0-100 scale):
                    - Budget: ${constraints.budget}% (Low=Constrained, High=Flexible)
                    - Time: ${constraints.time}% (Low=LongTerm, High=Urgent)
                    - Risk: ${constraints.risk}% (Low=Safe, High=Experimental)
                    Consider these when generating solutions.`;
                }

                // Unified Mega-Prompt
                const prompt = `
                Act as a World-Class TRIZ Expert (Theory of Inventive Problem Solving).
                Your task is to perform a complete TRIZ analysis on the following situation:
                "${situation}"

                Language: Response MUST be in ${lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.

                Reference Context (TRIZ 40 Principles):
                ${principlesText}

                ${constraintContext}

                You must perform the following steps and return a SINGLE JSON Object matching the schema below:
                
                Step 1: Validation
                Check if the input describes a valid problem. If not, set "isValid" to false and provide a "message".

                Step 2: Goal Definition (Ideal Final Result)
                Define the IFR. Provide a summary and estimate metrics (cost, durability, deployment) and operational delta (current vs ideas state 0-100).

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
                IMPORTANT: Return ONLY valid JSON. No Markdown.
                `;

                const response = await ai.models.generateContent({
                    model: "gemini-3-pro-preview",
                    config: { responseMimeType: "application/json" },
                    contents: prompt,
                });

                console.log("--- RAW LLM RESPONSE START ---");
                console.log(response.text);
                console.log("--- RAW LLM RESPONSE END ---");

                const parsed = safeParseJSON(response.text || "{}");
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

                // Ensure goal is passed as the object structure expected by TrizResults, so we might need to cast or keep it as object.
                // Actually, TrizClient currently expects FullTrizResult where goal is string... wait.
                // In TrizResults: const costMetric = parseMetric((goal as any)?.metrics?.logistics_cost);
                // references goal as an object (via any cast).
                // So passing the object directly is actually BETTER.
                // But TypeScript types say string.
                // We will relax the type check in the return or cast it.

                // Save to Database
                saveAnalysis(situation, lang, constraints, fullResult);

                // Return directly, don't wrap in { data: ... }
                return fullResult;

            } catch (error: any) {
                console.error("Unified Analysis Error:", error);
                throw new Error(error.message || "An unexpected error occurred.");
            }
        }
    })
};