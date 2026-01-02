// Script to parse Excel file and extract all publication records
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'NA' || dateStr === '--' || dateStr === 'N/A' || dateStr === '') return null;
  
  // Handle Excel date serial number
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    return date;
  }
  
  // Handle MM/DD/YYYY or DD/MM/YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let part1 = parseInt(parts[0]);
      let part2 = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      
      // Try MM/DD/YYYY first
      if (part1 <= 12 && part2 <= 31) {
        const date1 = new Date(year, part1 - 1, part2);
        if (part2 <= 12 && part1 > 12) {
          return new Date(year, part2 - 1, part1);
        }
        return date1;
      }
      // Otherwise try DD/MM/YYYY
      if (part2 <= 12 && part1 <= 31) {
        return new Date(year, part2 - 1, part1);
      }
    }
  }
  
  // Handle DD-MM-YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.match(/[A-Za-z]/)) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length <= 2) {
      let day = parseInt(parts[0]);
      let month = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      return new Date(year, month - 1, day);
    }
  }
  
  // Try standard Date parsing
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const extractAuthorName = (authorStr) => {
  if (!authorStr) return 'Unknown';
  const match = authorStr.toString().match(/^([^:]+)/);
  return match ? match[1].trim() : authorStr.toString().trim();
};

const parseImpactFactor = (ifStr) => {
  if (!ifStr || ifStr === 'NA' || ifStr === '--' || ifStr === 'N/A' || ifStr === '') return 0;
  if (typeof ifStr === 'number') return isNaN(ifStr) ? 0 : ifStr;
  const strValue = String(ifStr).trim();
  if (strValue === 'Not IF' || strValue === 'Not mentioned yet' || strValue === 'Not Applicable') return 0;
  const cleaned = strValue.replace(/[^\d.-]/g, '');
  if (cleaned) {
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Read Excel file - try multiple locations
let excelPath = path.join(__dirname, '..', 'dist', 'assets', 'RSCI Research Record (Responses).xlsx');
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'publications.xlsx');
}
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'public', 'RSCI Research Record (Responses).xlsx');
}
if (!fs.existsSync(excelPath)) {
  console.error('Excel file not found. Tried:', [
    path.join(__dirname, '..', 'dist', 'assets', 'RSCI Research Record (Responses).xlsx'),
    path.join(__dirname, '..', 'publications.xlsx'),
    path.join(__dirname, '..', 'public', 'RSCI Research Record (Responses).xlsx')
  ]);
  process.exit(1);
}

console.log('Reading Excel file:', excelPath);
const workbook = XLSX.readFile(excelPath);
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (jsonData.length < 2) {
  console.error('Excel file must contain at least a header row and one data row');
  process.exit(1);
}

// Find column indices
const headerRow = jsonData[0].map(h => String(h || '').toLowerCase());
console.log('Headers:', jsonData[0]);

const titleIdx = headerRow.findIndex(h => h.includes('title') || h.includes('paper') || h.includes('publication'));
const authorIdx = headerRow.findIndex(h => (h.includes('author') || h.includes('name')) && !h.includes('co-author'));

// Prioritize "Date of Publication" column - this is the publication date, not entry date
let dateIdx = headerRow.findIndex(h => 
  h.toLowerCase() === 'date of publication' || 
  h.toLowerCase().trim() === 'date of publication'
);
if (dateIdx === -1) {
  dateIdx = headerRow.findIndex(h => 
    h.toLowerCase().includes('date of publication') || 
    h.toLowerCase().includes('publication date')
  );
}
// Exclude timestamp, entry date, or submission date columns
if (dateIdx === -1) {
  dateIdx = headerRow.findIndex(h => 
    h.toLowerCase().includes('date') && 
    !h.toLowerCase().includes('timestamp') &&
    !h.toLowerCase().includes('entry') &&
    !h.toLowerCase().includes('submission') &&
    !h.toLowerCase().includes('created')
  );
}
const journalIdx = headerRow.findIndex(h => h.includes('journal') || h.includes('conference') || h.includes('venue'));
const scopusIdx = headerRow.findIndex(h => h.includes('scopus') || h.includes('indexed'));

let impactFactorIdx = headerRow.findIndex(h => h === 'journal impact factor' || h.trim() === 'journal impact factor');
if (impactFactorIdx === -1) {
  impactFactorIdx = headerRow.findIndex(h => h.includes('journal impact factor'));
}
if (impactFactorIdx === -1) {
  impactFactorIdx = headerRow.findIndex(h => h.includes('impact factor'));
}
if (impactFactorIdx === -1) {
  impactFactorIdx = headerRow.findIndex(h => h.includes('impact') && !h.includes('impacted'));
}
if (impactFactorIdx === -1) {
  impactFactorIdx = headerRow.findIndex(h => h === 'if' || (h.includes('if') && !h.includes('information')));
}

console.log('Column indices:', { titleIdx, authorIdx, dateIdx, journalIdx, scopusIdx, impactFactorIdx });

if (titleIdx === -1 || authorIdx === -1) {
  console.error('Excel file must contain "Title" and "Author" columns');
  process.exit(1);
}

// Parse ALL data rows - extract ALL publications regardless of date
const publications = [];

for (let i = 1; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (!row || row.length === 0) continue;

  const title = row[titleIdx] || '';
  const author = row[authorIdx] || '';
  const dateStr = row[dateIdx] || '';
  const journal = row[journalIdx] || '';
  const scopus = row[scopusIdx] || '';
  const impactFactorStr = impactFactorIdx !== -1 ? (row[impactFactorIdx] || '') : '';
  
  const titleStr = String(title).trim();
  const authorStr = String(author).trim();
  
  // Skip invalid entries
  if (!titleStr || !authorStr || titleStr === '-' || titleStr === 'N/A' || titleStr === '') continue;

  const pubDate = parseDate(dateStr);
  const impactFactor = parseImpactFactor(impactFactorStr);
  
  // Include ALL publications with valid data (date is optional but preferred)
  publications.push({
    title: titleStr,
    author: authorStr,
    authorName: extractAuthorName(authorStr),
    date: pubDate, // Can be null if date parsing fails
    journal: String(journal).trim() || '',
    scopus: String(scopus).toLowerCase().includes('yes') || String(scopus).toLowerCase() === 'true',
    impactFactor: impactFactor
  });
}

// Calculate date range from actual data
const datesWithValues = publications.filter(p => p.date).map(p => p.date);
const minDate = datesWithValues.length > 0 ? new Date(Math.min(...datesWithValues)) : null;
const maxDate = datesWithValues.length > 0 ? new Date(Math.max(...datesWithValues)) : null;

console.log(`\n✅ Extracted ${publications.length} publications from Excel file`);
if (minDate && maxDate) {
  console.log(`Date range: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);
} else {
  console.log(`Note: Some publications may not have valid dates`);
}

// Generate JavaScript file content
const jsContent = `// Publication records data - ALL publications from Excel file
// Auto-generated from Excel file: RSCI Research Record (Responses).xlsx
// Generated on: ${new Date().toISOString()}
// Total publications: ${publications.length}

export const publicationsData = ${JSON.stringify(publications.map(pub => ({
  ...pub,
  date: pub.date ? pub.date.toISOString() : null
})), null, 2).replace(/"date":\s*"([^"]+)"/g, (match, dateStr) => {
  const date = new Date(dateStr);
  return `"date": new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()})`;
}).replace(/"date":\s*null/g, '"date": null')}
`;

// Write to publications.js
const outputPath = path.join(__dirname, '..', 'src', 'data', 'publications.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');
console.log(`\n✅ Generated publications data file: ${outputPath}`);
console.log(`Total publications: ${publications.length}`);

