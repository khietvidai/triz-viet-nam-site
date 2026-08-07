import type { D1Database } from '@cloudflare/workers-types';

/**
 * Saves a TRIZ analysis result to D1.
 *
 * Never throws: a storage failure must not break the analysis the user just
 * paid an LLM round-trip for. Returns false so callers can log/ignore.
 */
export async function saveAnalysis(
    db: D1Database | undefined,
    situation: string,
    lang: string,
    constraints: unknown,
    result: unknown
): Promise<boolean> {
    if (!db) {
        console.error('Skipping saveAnalysis: D1 binding DB is not available.');
        return false;
    }

    try {
        await db
            .prepare(
                `INSERT INTO history (situation, language, constraints, result)
                 VALUES (?, ?, ?, ?)`
            )
            .bind(
                situation,
                lang,
                JSON.stringify(constraints ?? {}),
                JSON.stringify(result ?? {})
            )
            .run();

        return true;
    } catch (error) {
        console.error('Failed to save analysis to D1:', error);
        return false;
    }
}
