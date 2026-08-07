import Database from 'better-sqlite3';
import path from 'path';

// Define the database path relative to CWD
const DB_PATH = path.join(process.cwd(), 'triz-data.db');

// Initialize the database
const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    situation TEXT NOT NULL,
    language TEXT NOT NULL,
    constraints TEXT,
    result TEXT
  )
`);

/**
 * Saves a TRIZ analysis result to the database.
 */
export function saveAnalysis(
    situation: string,
    lang: string,
    constraints: any,
    result: any
) {
    try {
        const stmt = db.prepare(`
            INSERT INTO history (situation, language, constraints, result) 
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(
            situation,
            lang,
            JSON.stringify(constraints || {}),
            JSON.stringify(result || {})
        );

        console.log("Analysis saved to database.");
        return true;
    } catch (error) {
        console.error("Failed to save analysis to DB:", error);
        return false;
    }
}
