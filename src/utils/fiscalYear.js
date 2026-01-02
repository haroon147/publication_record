// Utility functions for fiscal year calculations
// Fiscal year runs from July 1 to June 30

/**
 * Get fiscal year for a given date
 * @param {Date} date - Publication date
 * @returns {string|null} - Fiscal year string (e.g., "FY 24-25") or null if date is invalid
 */
export const getFiscalYear = (date) => {
  if (!date) return null
  // Handle both Date objects and date strings
  const dateObj = date instanceof Date ? date : new Date(date)
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return null
  }
  
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() // 0-11, where 6 = July
  
  // If month is July (6) or later, it's the start of the fiscal year
  // FY 24-25 means July 2024 to June 2025
  if (month >= 6) {
    // July-December: FY YY-(YY+1)
    const shortYear = year % 100
    const nextShortYear = (shortYear + 1) % 100
    return `FY ${shortYear}-${nextShortYear.toString().padStart(2, '0')}`
  } else {
    // January-June: FY (YY-1)-YY
    const shortYear = year % 100
    const prevShortYear = (shortYear - 1 + 100) % 100
    return `FY ${prevShortYear.toString().padStart(2, '0')}-${shortYear.toString().padStart(2, '0')}`
  }
}

/**
 * Get date range for a fiscal year
 * @param {string} fiscalYear - Fiscal year string (e.g., "FY 24-25")
 * @returns {{startDate: Date, endDate: Date}|null} - Date range or null if invalid
 */
export const getFiscalYearRange = (fiscalYear) => {
  if (!fiscalYear || !fiscalYear.startsWith('FY ')) {
    return null
  }
  
  const match = fiscalYear.match(/FY (\d{2})-(\d{2})/)
  if (!match) {
    return null
  }
  
  const startShortYear = parseInt(match[1])
  const endShortYear = parseInt(match[2])
  
  // Determine full years
  // If end year is less than start year, it means we're in the 2000s
  // Otherwise, we need to determine based on current date
  const currentYear = new Date().getFullYear()
  const currentCentury = Math.floor(currentYear / 100) * 100
  
  let startYear = currentCentury + startShortYear
  let endYear = currentCentury + endShortYear
  
  // If end year seems to be in the past, it might be next century
  if (endYear < startYear) {
    endYear += 100
  }
  
  // If start year seems too far in the future, adjust
  if (startYear > currentYear + 10) {
    startYear -= 100
    endYear -= 100
  }
  
  const startDate = new Date(startYear, 6, 1) // July 1
  const endDate = new Date(endYear, 5, 30) // June 30
  
  return { startDate, endDate }
}

/**
 * Get all fiscal years from publications
 * @param {Array} publications - Array of publication objects
 * @returns {Array} - Sorted array of fiscal year strings
 */
export const getAllFiscalYears = (publications) => {
  const fiscalYears = new Set()
  
  publications.forEach(pub => {
    if (pub.date) {
      const fy = getFiscalYear(pub.date)
      if (fy) {
        fiscalYears.add(fy)
      }
    }
  })
  
  // Sort fiscal years (most recent first)
  return Array.from(fiscalYears).sort((a, b) => {
    const aMatch = a.match(/FY (\d{2})-(\d{2})/)
    const bMatch = b.match(/FY (\d{2})-(\d{2})/)
    if (!aMatch || !bMatch) return 0
    
    const aYear = parseInt(aMatch[1])
    const bYear = parseInt(bMatch[1])
    return bYear - aYear // Descending order
  })
}

/**
 * Filter publications by fiscal year
 * @param {Array} publications - Array of publication objects
 * @param {string} fiscalYear - Fiscal year string (e.g., "FY 24-25") or "all"
 * @returns {Array} - Filtered publications
 */
export const filterByFiscalYear = (publications, fiscalYear) => {
  if (fiscalYear === 'all') {
    return publications
  }
  
  const range = getFiscalYearRange(fiscalYear)
  if (!range) {
    return publications
  }
  
  return publications.filter(pub => {
    if (!pub.date) return false
    // Validate that date is a valid Date object
    if (!(pub.date instanceof Date) || isNaN(pub.date.getTime())) {
      return false
    }
    return pub.date >= range.startDate && pub.date <= range.endDate
  })
}

