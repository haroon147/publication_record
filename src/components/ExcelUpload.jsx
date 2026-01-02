import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileCheck, AlertCircle } from 'lucide-react'

const ExcelUpload = ({ onDataLoaded }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadInfo, setUploadInfo] = useState(null)

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'NA' || dateStr === '--' || dateStr === 'N/A' || dateStr === '') return null
    
    // Helper function to validate date is reasonable (between 2000 and 2030)
    const isValidPublicationDate = (date) => {
      if (!date || isNaN(date.getTime())) return false
      const year = date.getFullYear()
      // Allow dates from 2000 to 2030 for publications
      return year >= 2000 && year <= 2030
    }
    
    // Handle Excel date serial number
    if (typeof dateStr === 'number') {
      // Excel serial numbers for dates 2000-2030 are roughly between 36526 and 47482
      // If the number is too small (< 30000), it's likely not a valid date serial
      if (dateStr < 30000 && dateStr > 0) {
        // Try as Excel serial number anyway
        const excelEpoch = new Date(1899, 11, 30)
        const date = new Date(excelEpoch.getTime() + dateStr * 86400000)
        if (isValidPublicationDate(date)) {
          return date
        }
        // If invalid, return null
        return null
      }
      // For larger numbers, treat as Excel serial
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + dateStr * 86400000)
      if (isValidPublicationDate(date)) {
        return date
      }
      return null
    }
    
    // Handle MM/DD/YYYY or DD/MM/YYYY format
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        let part1 = parseInt(parts[0])
        let part2 = parseInt(parts[1])
        let year = parseInt(parts[2])
        
        // Handle 2-digit years: assume 20xx for years 00-30, 19xx for years 31-99
        if (year < 100) {
          year += year <= 30 ? 2000 : 1900
        }
        
        // Try both MM/DD/YYYY and DD/MM/YYYY formats
        let date1 = null, date2 = null
        
        // Try MM/DD/YYYY (if part1 could be month)
        if (part1 >= 1 && part1 <= 12 && part2 >= 1 && part2 <= 31) {
          date1 = new Date(year, part1 - 1, part2)
        }
        
        // Try DD/MM/YYYY (if part2 could be month)
        if (part2 >= 1 && part2 <= 12 && part1 >= 1 && part1 <= 31) {
          date2 = new Date(year, part2 - 1, part1)
        }
        
        // Prefer the one that makes sense (valid date in our range)
        if (date1 && isValidPublicationDate(date1)) {
          // If both are valid, prefer the one where first part is <= 12 (more likely to be month)
          if (date2 && isValidPublicationDate(date2)) {
            return part1 <= 12 ? date1 : date2
          }
          return date1
        }
        if (date2 && isValidPublicationDate(date2)) {
          return date2
        }
      }
    }
    
    // Handle DD-MM-YYYY format
    if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.match(/[A-Za-z]/)) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        // Check if it's DD-MM-YYYY (first part is day, second is month)
        if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
          let day = parseInt(parts[0])
          let month = parseInt(parts[1])
          let year = parseInt(parts[2])
          const date = new Date(year, month - 1, day)
          if (isValidPublicationDate(date)) {
            return date
          }
        }
        // Check if it's YYYY-MM-DD format
        if (parts[0].length === 4 && parts[1].length <= 2 && parts[2].length <= 2) {
          let year = parseInt(parts[0])
          let month = parseInt(parts[1])
          let day = parseInt(parts[2])
          const date = new Date(year, month - 1, day)
          if (isValidPublicationDate(date)) {
            return date
          }
        }
      }
    }
    
    // Handle MMM-DD or Month-DD format
    const monthMatch = typeof dateStr === 'string' ? dateStr.match(/([A-Za-z]{3})-(\d{1,2})/i) : null
    if (monthMatch) {
      const months = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      }
      const month = months[monthMatch[1].toLowerCase()]
      const day = parseInt(monthMatch[2])
      // Default to current year if no year specified, but validate
      const currentYear = new Date().getFullYear()
      const date = new Date(currentYear, month, day)
      if (isValidPublicationDate(date)) {
        return date
      }
    }
    
    // Try standard Date parsing
    const date = new Date(dateStr)
    if (isValidPublicationDate(date)) {
      return date
    }
    
    return null
  }

  const extractAuthorName = (authorStr) => {
    if (!authorStr) return 'Unknown'
    // Extract name before colon or ID
    const match = authorStr.toString().match(/^([^:]+)/)
    return match ? match[1].trim() : authorStr.toString().trim()
  }

  const authorNameMap = {
    'muhammad yaseen': 'Dr. Muhammad Yaseen',
    'dr muhammad yaseen': 'Dr. Muhammad Yaseen',
    'dr. muhammad yaseen': 'Dr. Muhammad Yaseen',
    'a kashif': 'Dr. Ayesha Kashif',
    'ayesha kashif': 'Dr. Ayesha Kashif',
    'dr ayesha kashif': 'Dr. Ayesha Kashif',
    'dr. ayesha kashif': 'Dr. Ayesha Kashif'
  }

  const normalizeAuthorName = (name) => {
    if (!name) return 'Unknown'
    const cleaned = name.replace(/\./g, '').replace(/\s+/g, ' ').trim()
    const key = cleaned.toLowerCase()
    
    // Check if the name contains "A Kashif" or "Ayesha Kashif" and replace it
    if (key.includes('a kashif') || key.includes('ayesha kashif')) {
      // If it's just "A Kashif" or "Ayesha Kashif", return the normalized version
      if (key === 'a kashif' || key === 'ayesha kashif' || key === 'dr ayesha kashif' || key === 'dr. ayesha kashif') {
        return 'Dr. Ayesha Kashif'
      }
      // If it contains multiple authors, replace "A Kashif" with "Dr. Ayesha Kashif"
      let normalized = cleaned.replace(/\bA\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                               .replace(/\bAyesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                               .replace(/\bDr\s+Dr\s+Ayesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
                               .replace(/\bDr\.\s+Dr\.\s+Ayesha\s+Kashif\b/gi, 'Dr. Ayesha Kashif')
      return normalized
    }
    
    return authorNameMap[key] || cleaned
  }

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setUploadInfo(null)
    setLoading(true)

    try {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (jsonData.length < 2) {
            throw new Error('Excel file must contain at least a header row and one data row')
          }

          // Find column indices (case-insensitive search)
          const headerRow = jsonData[0].map(h => String(h || '').toLowerCase())
          
          // Log all headers for debugging
          console.log('📋 Excel Headers Found:', jsonData[0].map((h, idx) => ({ index: idx, header: h })))
          
          const titleIdx = headerRow.findIndex(h => h.includes('title') || h.includes('paper') || h.includes('publication'))
          const authorIdx = headerRow.findIndex(h => (h.includes('author') || h.includes('name')) && !h.includes('co-author'))
          
          // Prioritize "Date of Publication" column - this is the publication date, not entry date
          let dateIdx = headerRow.findIndex(h => 
            h.toLowerCase() === 'date of publication' || 
            h.toLowerCase().trim() === 'date of publication'
          )
          if (dateIdx === -1) {
            dateIdx = headerRow.findIndex(h => 
              h.toLowerCase().includes('date of publication') || 
              h.toLowerCase().includes('publication date')
            )
          }
          // Exclude timestamp, entry date, or submission date columns
          if (dateIdx === -1) {
            dateIdx = headerRow.findIndex(h => 
              h.toLowerCase().includes('date') && 
              !h.toLowerCase().includes('timestamp') &&
              !h.toLowerCase().includes('entry') &&
              !h.toLowerCase().includes('submission') &&
              !h.toLowerCase().includes('created')
            )
          }
          const journalIdx = headerRow.findIndex(h => h.includes('journal') || h.includes('conference') || h.includes('venue'))
          const scopusIdx = headerRow.findIndex(h => h.includes('scopus') || h.includes('indexed'))
          
          // Prioritize "Journal Impact Factor" column name - try exact match first
          let impactFactorIdx = headerRow.findIndex(h => h === 'journal impact factor' || h.trim() === 'journal impact factor')
          if (impactFactorIdx === -1) {
            impactFactorIdx = headerRow.findIndex(h => h.includes('journal impact factor'))
          }
          if (impactFactorIdx === -1) {
            impactFactorIdx = headerRow.findIndex(h => h.includes('impact factor'))
          }
          if (impactFactorIdx === -1) {
            impactFactorIdx = headerRow.findIndex(h => h.includes('impact') && !h.includes('impacted'))
          }
          if (impactFactorIdx === -1) {
            impactFactorIdx = headerRow.findIndex(h => h === 'if' || (h.includes('if') && !h.includes('information')))
          }
          
          console.log('🔍 Column Detection:', {
            titleIdx,
            authorIdx,
            dateIdx,
            journalIdx,
            scopusIdx,
            impactFactorIdx,
            impactFactorColumnName: impactFactorIdx !== -1 ? jsonData[0][impactFactorIdx] : 'NOT FOUND'
          })

          if (titleIdx === -1 || authorIdx === -1) {
            throw new Error('Excel file must contain "Title" and "Author" columns')
          }

          // Parse data rows - Load ALL publications regardless of date
          const publications = []

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || row.length === 0) continue

            const title = row[titleIdx] || ''
            const author = row[authorIdx] || ''
            const dateStr = row[dateIdx] || ''
            const journal = row[journalIdx] || ''
            const scopus = row[scopusIdx] || ''
            const impactFactorStr = impactFactorIdx !== -1 ? (row[impactFactorIdx] || '') : ''
            
            if (!title || !author) continue

            const pubDate = parseDate(dateStr)
            
            // Parse impact factor - handle various formats
            let impactFactor = 0
            if (impactFactorIdx !== -1 && row[impactFactorIdx] !== undefined && row[impactFactorIdx] !== null) {
              const value = row[impactFactorIdx]
              
              // Handle if it's already a number
              if (typeof value === 'number') {
                impactFactor = isNaN(value) ? 0 : value
              } else {
                // Handle string values
                const strValue = String(value).trim()
                // Check for various "no value" indicators
                if (strValue && 
                    strValue !== 'NA' && 
                    strValue !== 'N/A' && 
                    strValue !== '--' && 
                    strValue !== '-' && 
                    strValue !== '0' &&
                    strValue.toLowerCase() !== 'not if' &&
                    strValue.toLowerCase() !== 'not mentioned yet' &&
                    strValue.toLowerCase() !== 'not applicable') {
                  // Remove all non-numeric characters except decimal point and minus sign
                  const cleaned = strValue.replace(/[^\d.-]/g, '')
                  if (cleaned) {
                    const parsed = parseFloat(cleaned)
                    impactFactor = isNaN(parsed) ? 0 : parsed
                  }
                }
              }
            }
            
            // Include ALL publications regardless of date
            // Date filtering will be done via fiscal year filter in the dashboard
            const authorNameRaw = extractAuthorName(author)
            const authorName = normalizeAuthorName(authorNameRaw)

            publications.push({
              title: String(title).trim(),
              author: String(author).trim(),
              authorName: authorName,
              date: pubDate, // Can be null if date parsing fails
              dateStr: dateStr,
              journal: String(journal).trim(),
              scopus: String(scopus).toLowerCase().includes('yes') || String(scopus).toLowerCase() === 'true',
              impactFactor: impactFactor
            })
            
            if (!pubDate && i <= 5) {
              // Log first few rows with date parsing issues for debugging
              console.warn(`⚠️ Could not parse date for row ${i}:`, {
                dateStr: dateStr,
                title: String(title).substring(0, 30)
              })
            }
          }

          if (publications.length === 0) {
            throw new Error('No publications found in the Excel file. Please ensure the file contains valid data.')
          }

          // Debug: Log impact factor detection from Excel column
          const publicationsWithIF = publications.filter(p => p.impactFactor > 0)
          const totalIF = publications.reduce((sum, p) => sum + (p.impactFactor || 0), 0)
          
          // Get date range of loaded publications
          const datesWithValues = publications.filter(p => p.date).map(p => p.date)
          const minDate = datesWithValues.length > 0 ? new Date(Math.min(...datesWithValues)) : null
          const maxDate = datesWithValues.length > 0 ? new Date(Math.max(...datesWithValues)) : null
          
          console.log('📊 Journal Impact Factor Calculation:', {
            totalPublications: publications.length,
            publicationsWithImpactFactor: publicationsWithIF.length,
            totalJournalImpactFactor: totalIF.toFixed(2),
            impactFactorColumnIndex: impactFactorIdx,
            impactFactorColumnFound: impactFactorIdx !== -1,
            impactFactorColumnName: impactFactorIdx !== -1 ? jsonData[0][impactFactorIdx] : 'NOT FOUND',
            dateRange: minDate && maxDate ? 
              `${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}` : 
              'All publications (including those without dates)',
            publicationsWithDates: datesWithValues.length,
            sampleImpactFactors: publications.slice(0, 10).map(p => ({
              title: p.title.substring(0, 40),
              publicationDate: p.date ? p.date.toLocaleDateString() : 'No date',
              journalImpactFactor: p.impactFactor,
              impactFactorType: typeof p.impactFactor
            }))
          })
          
          if (impactFactorIdx === -1) {
            console.error('❌ Journal Impact Factor column NOT FOUND!')
            console.warn('⚠️ Available columns:', jsonData[0].map((h, i) => `${i}: "${h}"`).join(', '))
            console.warn('⚠️ Please ensure your file has a column named "Journal Impact Factor", "Impact Factor", or "IF"')
          } else {
            console.log(`✅ Journal Impact Factor column found at index ${impactFactorIdx}: "${jsonData[0][impactFactorIdx]}"`)
            console.log(`📈 Total Journal Impact Factor (Sum): ${totalIF.toFixed(2)}`)
            console.log(`📄 All publications loaded: ${publications.length}`)
            if (minDate && maxDate) {
              console.log(`📅 Publication date range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`)
            }
            if (publicationsWithIF.length === 0) {
              console.warn('⚠️ No publications with impact factor > 0 found. Check if impact factor values are numeric.')
            }
          }

          setUploadInfo({
            totalPublications: publications.length,
            publicationsWithIF: publicationsWithIF.length,
            impactFactorColumnFound: impactFactorIdx !== -1,
            totalImpactFactor: totalIF
          })

          onDataLoaded(publications)
          setLoading(false)
        } catch (err) {
          setError(err.message || 'Error parsing Excel file')
          setLoading(false)
        }
      }

      reader.onerror = () => {
        setError('Error reading file')
        setLoading(false)
      }

      reader.readAsArrayBuffer(selectedFile)
    } catch (err) {
      setError(err.message || 'Error processing file')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
          disabled={loading}
        />
        <label
          htmlFor="excel-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Processing file...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-blue-500 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload Excel file
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx, .xls, and .csv files
              </p>
            </>
          )}
        </label>
      </div>

      {file && !loading && uploadInfo && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-green-600">
            <FileCheck className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="text-green-800 font-medium">
              ✓ {uploadInfo.totalPublications} publications loaded
            </p>
            {uploadInfo.impactFactorColumnFound ? (
              <p className="text-green-700 mt-1">
                Impact Factor column detected: {uploadInfo.publicationsWithIF} publications have impact factors
                {uploadInfo.totalImpactFactor > 0 && (
                  <span className="font-semibold"> (Total IF: {uploadInfo.totalImpactFactor.toFixed(2)})</span>
                )}
              </p>
            ) : (
              <p className="text-yellow-700 mt-1">
                ⚠ Impact Factor column not found. Please ensure your Excel file has a column named "Impact Factor", "IF", or "Impact Factor"
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">Expected Excel Format:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Required columns: <strong>Title</strong>, <strong>Author</strong></li>
          <li>Optional columns: <strong>Date of Publication</strong>, <strong>Journal</strong>, <strong>Scopus</strong>, <strong>Journal Impact Factor</strong></li>
          <li>Date format: MM/DD/YYYY, DD-MM-YYYY, or Excel date serial number</li>
          <li>Impact Factor: Numeric value (e.g., 3.5, 5.2)</li>
          <li>All publications from the Excel file will be loaded. Use fiscal year filters in the dashboard to filter by date range.</li>
        </ul>
      </div>
    </div>
  )
}

export default ExcelUpload

