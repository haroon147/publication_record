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
  
  // Filter out obviously invalid dates (before 2000 or too far in the future)
  // Allow dates from 2000 to 2030 for publication dates
  if (year < 2000 || year > 2030) {
    return null
  }
  
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
  
  // Determine full years - for our data range (2000-2030), fiscal years are in the 2000s
  // FY 22-23 means July 1, 2022 to June 30, 2023
  // FY 11-12 means July 1, 2011 to June 30, 2012
  // FY 25-26 means July 1, 2025 to June 30, 2026
  
  let startYear, endYear
  
  if (endShortYear < startShortYear) {
    // Century crossing case (e.g., FY 99-00 = 1999-2000)
    // For our data, this shouldn't happen, but handle it
    startYear = 1900 + startShortYear
    endYear = 2000 + endShortYear
  } else {
    // Normal case: both years in 2000s (for years 00-30)
    // For years 00-30, assume 2000s
    startYear = 2000 + startShortYear
    endYear = 2000 + endShortYear
  }
  
  // Validate: ensure years are in reasonable range (2000-2030)
  if (startYear < 2000 || startYear > 2030) {
    console.warn(`Invalid start year ${startYear} for fiscal year ${fiscalYear}`)
    return null
  }
  if (endYear < 2000 || endYear > 2030) {
    console.warn(`Invalid end year ${endYear} for fiscal year ${fiscalYear}`)
    return null
  }
  
  const startDate = new Date(startYear, 6, 1) // July 1
  const endDate = new Date(endYear, 5, 30) // June 30
  
  // Set time to start/end of day for accurate comparison
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)
  
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
  const sorted = Array.from(fiscalYears).sort((a, b) => {
    const aMatch = a.match(/FY (\d{2})-(\d{2})/)
    const bMatch = b.match(/FY (\d{2})-(\d{2})/)
    if (!aMatch || !bMatch) return 0
    
    const aYear = parseInt(aMatch[1])
    const bYear = parseInt(bMatch[1])
    
    // Handle century wrapping (e.g., FY 99-00 should come before FY 01-02)
    if (aYear > 50 && bYear < 50) {
      return -1 // a is in 1900s, b is in 2000s, so a comes first
    }
    if (aYear < 50 && bYear > 50) {
      return 1 // a is in 2000s, b is in 1900s, so b comes first
    }
    
    return bYear - aYear // Descending order
  })
  
  return sorted
}

/**
 * Filter publications by fiscal year
 * @param {Array} publications - Array of publication objects
 * @param {string} fiscalYear - Fiscal year string (e.g., "FY 24-25") or "all"
 * @returns {Array} - Filtered publications
 */
export const filterByFiscalYear = (publications, fiscalYear) => {
  // If "all" is selected, return all publications (including those without dates)
  if (fiscalYear === 'all' || !fiscalYear) {
    console.log(`✅ Returning ALL publications (${publications.length} total) for fiscal year: ${fiscalYear}`)
    return publications
  }
  
  const range = getFiscalYearRange(fiscalYear)
  if (!range) {
    console.warn(`Could not parse fiscal year range for: ${fiscalYear}`)
    return publications
  }
  
  console.log(`🔍 Filtering by fiscal year ${fiscalYear}:`, {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
    totalPublications: publications.length
  })
  
  const filtered = publications.filter(pub => {
    if (!pub.date) {
      return false
    }
    
    // Validate that date is a valid Date object
    let dateObj = pub.date
    if (!(dateObj instanceof Date)) {
      // Try to convert string or other format to Date
      dateObj = new Date(dateObj)
    }
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return false
    }
    
    // Compare dates (normalize to start of day for comparison)
    const pubDate = new Date(dateObj)
    pubDate.setHours(0, 0, 0, 0)
    
    const isInRange = pubDate >= range.startDate && pubDate <= range.endDate
    
    return isInRange
  })
  
  console.log(`✅ Filtered ${filtered.length} publications for ${fiscalYear}`)
  
  return filtered
}

