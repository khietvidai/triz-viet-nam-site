
import fs from 'fs';
import path from 'path';

const matrixRaw = fs.readFileSync(path.join(process.cwd(), 'src/Data/Matrix2010.csv'), 'utf-8');
const matrixRows = matrixRaw.trim().split('\n');
const rows = matrixRows.map(row => row.split(','));

console.log(`Dimensions: ${rows.length} rows`);
if (rows.length > 0) console.log(`Columns in row 0: ${rows[0].length}`);

// Test specific lookups
// Case 1: ID 1 vs ID 1 (Should be empty)
// Index 0, 0
console.log(`Lookup [0][0] (1 vs 1): '${rows[0][0]}'`);

// Case 2: ID 1 vs ID 2
// Index 0, 1
console.log(`Lookup [0][1] (1 vs 2): '${rows[0][1]}'`);

// Case 3: ID 2 vs ID 1
// Index 1, 0
console.log(`Lookup [1][0] (2 vs 1): '${rows[1][0]}'`);

// Case 4: ID 39 vs ID 39 (Check diagonal further down)
// Index 38, 38
// console.log(`Lookup [38][38]: '${rows[38][38]}'`);
