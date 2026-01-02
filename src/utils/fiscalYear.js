// Fiscal Year utilities
// Fiscal years run from July 1 to June 30
// FY-24-25 = July 1, 2024 to June 30, 2025

export const getFiscalYear = (date) => {
  if (!date) return null;
  
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11 (Jan = 0, Dec = 11)
  
  // If month is July (6) to December (11), fiscal year starts in current year
  // If month is January (0) to June (5), fiscal year started in previous year
  if (month >= 6) {
    // July to December: FY-YY-(YY+1)
    const fyStart = year;
    const fyEnd = year + 1;
    return {
      code: `FY-${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`,
      startYear: fyStart,
      endYear: fyEnd,
      startDate: new Date(fyStart, 6, 1), // July 1
      endDate: new Date(fyEnd, 5, 30) // June 30
    };
  } else {
    // January to June: FY-(YY-1)-YY
    const fyStart = year - 1;
    const fyEnd = year;
    return {
      code: `FY-${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`,
      startYear: fyStart,
      endYear: fyEnd,
      startDate: new Date(fyStart, 6, 1), // July 1
      endDate: new Date(fyEnd, 5, 30) // June 30
    };
  }
};

export const getFiscalYearRange = (fyCode) => {
  // Parse FY-24-25 format
  const match = fyCode.match(/FY-(\d{2})-(\d{2})/);
  if (!match) return null;
  
  const startYY = parseInt(match[1]);
  const endYY = parseInt(match[2]);
  
  // Convert YY to full year (assuming 2000s)
  const startYear = startYY < 50 ? 2000 + startYY : 1900 + startYY;
  const endYear = endYY < 50 ? 2000 + endYY : 1900 + endYY;
  
  return {
    startDate: new Date(startYear, 6, 1), // July 1
    endDate: new Date(endYear, 5, 30) // June 30
  };
};

export const getAllFiscalYears = (publications) => {
  const fySet = new Set();
  
  publications.forEach(pub => {
    if (pub.date) {
      const fy = getFiscalYear(pub.date);
      if (fy) {
        fySet.add(fy.code);
      }
    }
  });
  
  // Convert to array and sort (newest first)
  const fiscalYears = Array.from(fySet).sort((a, b) => {
    const matchA = a.match(/FY-(\d{2})-(\d{2})/);
    const matchB = b.match(/FY-(\d{2})-(\d{2})/);
    if (!matchA || !matchB) return 0;
    
    const startYYA = parseInt(matchA[1]);
    const startYYB = parseInt(matchB[1]);
    return startYYB - startYYA; // Descending order (newest first)
  });
  
  return fiscalYears;
};

export const filterByFiscalYear = (publications, fyCode) => {
  if (!fyCode || fyCode === 'all') return publications;
  
  const range = getFiscalYearRange(fyCode);
  if (!range) return publications;
  
  return publications.filter(pub => {
    if (!pub.date) return false;
    return pub.date >= range.startDate && pub.date <= range.endDate;
  });
};

