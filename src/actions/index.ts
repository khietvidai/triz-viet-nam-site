import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import OpenAI from 'openai';
import { saveAnalysis } from '@/lib/db';

// Data Imports
import principlesText from '../Data/40principles.md?raw';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';

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
 * Calls DeepSeek with high-speed JSON mode or Deep Reasoning mode.
 */
async function callDeepSeek(
    client: OpenAI,
    messages: ChatMessage[],
    options: { json?: boolean; model?: string } = {}
): Promise<string> {
    const selectedModel = options.model || DEEPSEEK_MODEL;
    const isReasoner = selectedModel.includes('reasoner');

    const baseParams: Record<string, unknown> = {
        model: selectedModel,
        messages,
        stream: false,
    };

    if (!isReasoner) {
        baseParams.temperature = 0.3;
    }

    const params = options.json && !isReasoner
        ? { ...baseParams, response_format: { type: 'json_object' } }
        : baseParams;

    try {
        const completion = await client.chat.completions.create(params as any);
        return (completion as any).choices?.[0]?.message?.content ?? '';
    } catch (error) {
        if (!options.json || isReasoner) throw error;
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
    }),

    solveSecoperProblem: defineAction({
        input: z.object({
            situation: z.string(),
            parkingLotSolutions: z.array(z.string()).optional().default([]),
            lang: z.enum(['en', 'vi']).default('vi'),
            modelMode: z.enum(['fast', 'deep']).default('fast'),
        }),
        handler: async ({ situation, parkingLotSolutions, lang, modelMode }, context) => {
            if (!situation || situation.trim() === "") {
                return { error: lang === 'vi' ? "Vui lòng nhập tình huống cần chẩn đoán." : "Please enter a problem situation." };
            }
            try {
                const client = createClient(context.locals);
                const targetModel = modelMode === 'deep' ? 'deepseek-reasoner' : 'deepseek-chat';

                const parkingLotText = parkingLotSolutions && parkingLotSolutions.length > 0
                    ? parkingLotSolutions.map((s, i) => `${i + 1}. ${s}`).join('\n')
                    : 'None provided.';

                const systemPrompt = `
You are the Chief Diagnostic Master and Facilitator of the S.E.C.O.P.E.R 3.0 Framework (Phát biểu đúng bài toán).
Your mission is to perform a complete, rigorous, and deep multi-step diagnostic analysis on real-world problems based strictly on the SECOPER 3.0 specification.
You understand that SECOPER does NOT solve the problem; it ensures we are formulating the EXACT RIGHT problem before passing it to TRIZ or engineering.

Key Principles & Rules of SECOPER 3.0:
1. Giai đoạn 0 (TRIAGE & PARKING LOT):
   - Check if problem is multi-variable, persistent, or contradictory (Qualified for SECOPER) vs simple single-step (Just-Do-It).
   - Enforce Parking Lot: Seal preconceived solutions to prevent reverse-engineering bias.

2. S - SITUATION:
   - Quantify facts (baseline -> current), target statement with deadline.
   - Guardrail metric (chỉ số đối trọng) with threshold "not worse than [limit]" to prevent waterbed effect.
   - Shadow metric (chỉ số bóng) without financial KPI bonuses to prevent Goodhart's Law distortion.
   - S-Curve Sanity Check: If current system reached theoretical ceiling, forbid mere optimization and flag need for a new paradigm.

3. E - EVIDENCE:
   - 4-part falsification for core assumptions: [Assumption], [Falsifier] (crafted from independent Devil's Advocate / Red-Team perspective), [Evidence], [Conclusion: TRUE/FALSE/INSUFFICIENT_DATA].
   - Risk-tolerance threshold: If cost to verify > cost to prototype, tag [Giả định rủi ro cao — kiểm chứng bằng thực thi].
   - Verify metric validity.

4. C - CORE GAP:
   - 6 steps: List 4-6 statements labeled exactly as Symptom, Gap, Contradiction, Cause, Consequence.
   - Filter only valid candidates (Gap & Contradiction).
   - Dependency graph: X disappears if Y solved? X leverages Z?
   - Hierarchical ranking: Rank primarily by Impact (1-5), and ONLY break ties with Leverage (1-5). NEVER sum scores (Impact + Leverage).
   - Reject Administrative Contradictions ("want marketing but lack money" -> downgrade to Gap or reframe to physical/technical contradiction).
   - Strategic Bypass: Any candidate with Leverage = 5/5 MUST be split into a parallel strategic restructuring branch.

5. OR - ROOT OBSTACLE:
   - Multi-branch cause tree (include at least 1 alternative/fishbone branch).
   - Reinforcing Loop Check: If leaf is part of a reinforcing loop, do NOT just chop the leaf; the core obstacle is the weakest link of the loop.
   - Incentive Check (Cobra effect): Does anyone secretly benefit from the obstacle? If yes, problem shifts to redesigning incentive mechanisms.
   - Score 3-5 leaf causes by Impact and Directness; select top 1.

6. P - PERSPECTIVE:
   - Locus (Individual, Department, System, Market).
   - Authority level needed and decision required.
   - Escalation Business Case with Default-to-Action rule and D-Day deadline (anti-zombie submission).
   - Horizontal Handshake (co-sign if obstacle involves another department).
   - Market handling: Escalate, Turn harm into benefit (TRIZ 22), or reduce scope.

7. E - ESSENCE:
   - Template A (Gap) or Template B (Contradiction).
   - Check 3 mandatory anchors: Core Gap matches C, Obstacle matches OR, Constraints match S.

8. R - REFRAME:
   - Question embedded with TRIZ IFR DNA: "TỰ" (SELF-) and "nguồn lực sẵn có" (readily available resources).
   - Resource Radar: 5 zones (Empty space, Idle time/waiting, Waste info/materials, Physical differentials, Turning harm into benefit).
   - 5 Golden Gates: 1. No implicit solution (check vs Parking lot); 2. Measurable; 3. Authority exists; 4. Unambiguous; 5. Real vs fake constraints (eliminate fake company habits).
   - Living Hypothesis notice & Boomerang loopback rule (Edge 8).

Language: All values in the JSON output MUST be in ${lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}.
Output format: Return ONLY a valid JSON object matching the FullSecoperResult schema. No markdown wrapping outside the JSON.`;

                const userPrompt = `
Perform a complete SECOPER 3.0 diagnostic on the following situation:
"""${situation}"""

Parking Lot Sealed Preconceptions:
"""${parkingLotText}"""

Return a single valid JSON object strictly matching this schema:
{
  "triage": {
    "isQualified": true,
    "triageReason": "string",
    "isJustDoIt": false,
    "parkingLotSolutions": ["string"]
  },
  "situation": {
    "situationStatement": "string",
    "targetStatement": "string",
    "guardrailMetric": {
      "name": "string",
      "threshold": "string",
      "rationale": "string"
    },
    "shadowMetric": {
      "name": "string",
      "rationale": "string"
    },
    "rawGap": "string",
    "sCurveSanityCheck": {
      "status": "OPTIMIZATION_ALLOWED" or "S_CURVE_CEILING_REACHED",
      "analysis": "string",
      "recommendation": "string"
    },
    "isProxyOrFermi": false
  },
  "evidence": {
    "assumptions": [
      {
        "assumption": "string",
        "falsifier": "string (Red-team independent falsifier)",
        "evidence": "string",
        "conclusion": "TRUE" | "FALSE" | "INSUFFICIENT_DATA",
        "riskLabel": "string or empty"
      }
    ],
    "metricValidityConclusion": "string",
    "redTeamReviewSummary": "string"
  },
  "coreGap": {
    "allCandidates": [
      {
        "id": "cg1",
        "text": "string",
        "label": "Symptom" | "Gap" | "Contradiction" | "Cause" | "Consequence",
        "impactScore": 1-5,
        "leverageScore": 1-5,
        "rank": 1,
        "isStrategicBypass": boolean,
        "isAdministrativeContradictionRejected": boolean
      }
    ],
    "validCandidates": [
      {
        "id": "cg1",
        "text": "string",
        "label": "Gap" | "Contradiction",
        "impactScore": 1-5,
        "leverageScore": 1-5,
        "rank": 1,
        "isStrategicBypass": boolean
      }
    ],
    "dependencyAnalysis": "string",
    "selectedCoreGap": {
      "type": "Gap" | "Contradiction",
      "statement": "string",
      "rationale": "string"
    },
    "parallelBranch": {
      "type": "STRATEGIC_RESTRUCTURING" | "INDEPENDENT_CORE_GAP",
      "statement": "string"
    }
  },
  "obstacle": {
    "causeTree": [
      {
        "id": "node1",
        "name": "string",
        "parentId": "optional parent id",
        "impactScore": 1-5,
        "directnessScore": 1-5,
        "isLeaf": boolean,
        "isAlternativeBranch": boolean
      }
    ],
    "leafCauses": [
      {
        "cause": "string",
        "impactScore": 1-5,
        "directnessScore": 1-5
      }
    ],
    "selectedObstacle": "string",
    "impactRationale": "string",
    "reinforcingLoopCheck": {
      "isReinforcingLoop": boolean,
      "analysis": "string",
      "weakestLink": "string"
    },
    "incentiveCheck": {
      "hasVestedInterest": boolean,
      "cobraEffectAnalysis": "string",
      "recommendation": "string"
    }
  },
  "perspective": {
    "locus": "INDIVIDUAL" | "DEPARTMENT" | "SYSTEM" | "MARKET",
    "authorityLevelNeeded": "string",
    "keyDecisionMaker": "string",
    "decisionToChange": "string",
    "escalationCase": {
      "businessCaseSummary": "string",
      "defaultToActionNotice": "string (with D-Day deadline)",
      "horizontalHandshakeCoSignDepartment": "string"
    },
    "marketHandlingStrategy": "ESCALATE" | "TURN_HARM_INTO_BENEFIT" | "REDUCE_SCOPE_TO_SUB_SYSTEM"
  },
  "essence": {
    "branchType": "A_GAP" | "B_CONTRADICTION",
    "statement": "string",
    "anchorsCheck": {
      "isCoreGapMatched": true,
      "isObstacleMatched": true,
      "isSituationMatched": true
    }
  },
  "reframe": {
    "reframeQuestion": "string (strictly following Pattern A or B with 'TỰ' and 'nguồn lực sẵn có')",
    "resourceRadar": {
      "emptySpace": "string",
      "idleTime": "string",
      "wasteInfo": "string",
      "physicalDifferential": "string",
      "turnHarmIntoBenefit": "string"
    },
    "fiveGoldenGates": {
      "noImplicitSolution": true,
      "isMeasurable": true,
      "hasAuthority": true,
      "isUnambiguous": true,
      "areRealConstraints": true
    },
    "gateNotes": ["string"],
    "livingHypothesisNotice": "string"
  }
}
IMPORTANT: Output ONLY pure JSON.`;

                const rawText = await callDeepSeek(
                    client,
                    [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    { json: true, model: targetModel }
                );

                console.log("--- SECOPER RAW LLM RESPONSE START ---");
                console.log(rawText);
                console.log("--- SECOPER RAW LLM RESPONSE END ---");

                const parsed = safeParseJSON(rawText || "{}");
                return parsed;

            } catch (error: any) {
                console.error("SECOPER Analysis Error:", error);
                throw new Error(error.message || "An unexpected error occurred during SECOPER diagnosis.");
            }
        }
    })
};

