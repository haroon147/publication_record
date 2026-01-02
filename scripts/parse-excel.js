// Script to parse Excel file and extract all publication records
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'NA' || dateStr === '--' || dateStr === 'N/A' || dateStr === '') return null;
  
  // Helper function to validate date is reasonable (between 2000 and 2030)
  const isValidPublicationDate = (date) => {
    if (!date || isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    // Allow dates from 2000 to 2030 for publications
    return year >= 2000 && year <= 2030;
  };
  
  // Handle Excel date serial number
  if (typeof dateStr === 'number') {
    // Excel serial numbers for dates 2000-2030 are roughly between 36526 and 47482
    // If the number is too small (< 30000), it's likely not a valid date serial
    if (dateStr < 30000 && dateStr > 0) {
      // Try as Excel serial number anyway
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
      if (isValidPublicationDate(date)) {
        return date;
      }
      // If invalid, return null
      return null;
    }
    // For larger numbers, treat as Excel serial
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    if (isValidPublicationDate(date)) {
      return date;
    }
    return null;
  }
  
  // Handle MM/DD/YYYY or DD/MM/YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let part1 = parseInt(parts[0]);
      let part2 = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // Handle 2-digit years: assume 20xx for years 00-30, 19xx for years 31-99
      if (year < 100) {
        year += year <= 30 ? 2000 : 1900;
      }
      
      // Try both MM/DD/YYYY and DD/MM/YYYY formats
      let date1 = null, date2 = null;
      
      // Try MM/DD/YYYY (if part1 could be month)
      if (part1 >= 1 && part1 <= 12 && part2 >= 1 && part2 <= 31) {
        date1 = new Date(year, part1 - 1, part2);
      }
      
      // Try DD/MM/YYYY (if part2 could be month)
      if (part2 >= 1 && part2 <= 12 && part1 >= 1 && part1 <= 31) {
        date2 = new Date(year, part2 - 1, part1);
      }
      
      // Prefer the one that makes sense (valid date in our range)
      if (date1 && isValidPublicationDate(date1)) {
        // If both are valid, prefer the one where first part is <= 12 (more likely to be month)
        if (date2 && isValidPublicationDate(date2)) {
          return part1 <= 12 ? date1 : date2;
        }
        return date1;
      }
      if (date2 && isValidPublicationDate(date2)) {
        return date2;
      }
    }
  }
  
  // Handle DD-MM-YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.match(/[A-Za-z]/)) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // Check if it's DD-MM-YYYY (first part is day, second is month)
      if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
        let day = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        const date = new Date(year, month - 1, day);
        if (isValidPublicationDate(date)) {
          return date;
        }
      }
      // Check if it's YYYY-MM-DD format
      if (parts[0].length === 4 && parts[1].length <= 2 && parts[2].length <= 2) {
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        let day = parseInt(parts[2]);
        const date = new Date(year, month - 1, day);
        if (isValidPublicationDate(date)) {
          return date;
        }
      }
    }
  }
  
  // Try standard Date parsing
  const date = new Date(dateStr);
  if (isValidPublicationDate(date)) {
    return date;
  }
  
  return null;
};

const extractAuthorName = (authorStr) => {
  if (!authorStr) return 'Unknown';
  const match = authorStr.toString().match(/^([^:]+)/);
  return match ? match[1].trim() : authorStr.toString().trim();
};

const authorNameMap = {
  'muhammad yaseen': 'Dr. Muhammad Yaseen',
  'dr muhammad yaseen': 'Dr. Muhammad Yaseen',
  'dr. muhammad yaseen': 'Dr. Muhammad Yaseen',
  'a kashif': 'Dr. Ayesha Kashif',
  'ayesha kashif': 'Dr. Ayesha Kashif',
  'dr ayesha kashif': 'Dr. Ayesha Kashif',
  'dr. ayesha kashif': 'Dr. Ayesha Kashif',
  'jamal uddin': 'Dr. Jamal Uddin',
  'dr jamal uddin': 'Dr. Jamal Uddin',
  'dr. jamal uddin': 'Dr. Jamal Uddin'
};

const normalizeAuthorName = (name) => {
  if (!name) return 'Unknown';
  const cleaned = name.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  const key = cleaned.toLowerCase();
  
  // Check if the name contains "A Kashif" or "Ayesha Kashif" and replace it
  if (key.includes('a kashif') || key.includes('ayesha kashif')) {
    // If it's just "A Kashif" or "Ayesha Kashif", return the normalized version
    if (key === 'a kashif' || key === 'ayesha kashif' || key === 'dr ayesha kashif' || key === 'dr. ayesha kashif') {
      return 'Dr. Ayesha Kashif';
    }
    // If it contains multiple authors, replace "A Kashif" with "Dr. Ayesha Kashif"
    let normalized = cleaned.replace(/\bA\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                             .replace(/\bAyesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                             .replace(/\bDr\s+Dr\s+Ayesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                             .replace(/\bDr\.\s+Dr\.\s+Ayesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif');
    return normalized;
  }
  
  return authorNameMap[key] || cleaned;
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

// Read Excel file - try multiple locations (prioritize src/data/publications.xlsx)
let excelPath = path.join(__dirname, '..', 'src', 'data', 'publications.xlsx');
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'src', 'data', 'Publication.xlsx');
}
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'Publications.xlsx');
}
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'publications.xlsx');
}
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'dist', 'assets', 'RSCI Research Record (Responses).xlsx');
}
if (!fs.existsSync(excelPath)) {
  excelPath = path.join(__dirname, '..', 'public', 'RSCI Research Record (Responses).xlsx');
}
if (!fs.existsSync(excelPath)) {
  console.error('Excel file not found. Tried:', [
    path.join(__dirname, '..', 'src', 'data', 'Publication.xlsx'),
    path.join(__dirname, '..', 'Publications.xlsx'),
    path.join(__dirname, '..', 'publications.xlsx'),
    path.join(__dirname, '..', 'dist', 'assets', 'RSCI Research Record (Responses).xlsx'),
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
  const authorNameRaw = extractAuthorName(authorStr);
  const authorName = normalizeAuthorName(authorNameRaw);

  // Include ALL publications with valid data (date is optional but preferred)
  publications.push({
    title: titleStr,
    author: authorStr,
    authorName: authorName,
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

// Calculate fiscal years from publications
const getFiscalYear = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11, where 6 = July
  if (month >= 6) {
    const shortYear = year % 100;
    const nextShortYear = (shortYear + 1) % 100;
    return `FY ${shortYear}-${nextShortYear.toString().padStart(2, '0')}`;
  } else {
    const shortYear = year % 100;
    const prevShortYear = (shortYear - 1 + 100) % 100;
    return `FY ${prevShortYear.toString().padStart(2, '0')}-${shortYear.toString().padStart(2, '0')}`;
  }
};

const fiscalYears = new Set();
publications.forEach(pub => {
  if (pub.date) {
    const fy = getFiscalYear(pub.date);
    if (fy) fiscalYears.add(fy);
  }
});
const sortedFiscalYears = Array.from(fiscalYears).sort((a, b) => {
  const aMatch = a.match(/FY (\d{2})-(\d{2})/);
  const bMatch = b.match(/FY (\d{2})-(\d{2})/);
  if (!aMatch || !bMatch) return 0;
  return parseInt(bMatch[1]) - parseInt(aMatch[1]); // Descending order
});

console.log(`\n✅ Extracted ${publications.length} publications from Excel file`);
if (minDate && maxDate) {
  console.log(`Date range: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);
} else {
  console.log(`Note: Some publications may not have valid dates`);
}
console.log(`📅 Fiscal years found: ${sortedFiscalYears.join(', ')}`);
console.log(`📊 Publications by fiscal year:`);
sortedFiscalYears.forEach(fy => {
  const count = publications.filter(p => {
    if (!p.date) return false;
    const pubFY = getFiscalYear(p.date);
    return pubFY === fy;
  }).length;
  console.log(`   ${fy}: ${count} publications`);
});

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

