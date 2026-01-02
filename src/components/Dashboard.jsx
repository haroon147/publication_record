import React, { useMemo, useState } from 'react'
import Statistics from './Statistics'
import QuarterlyAnalysis from './QuarterlyAnalysis'
import AuthorLeaderboard from './AuthorLeaderboard'
import PublicationList from './PublicationList'
import { BarChart3, Database, Filter } from 'lucide-react'
import { getAllFiscalYears, filterByFiscalYear } from '../utils/fiscalYear'

const Dashboard = ({ publications }) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('FY-24-25') // Default to current FY
  
  // Get all unique fiscal years from publications
  const fiscalYears = useMemo(() => {
    const allFYs = getAllFiscalYears(publications);
    return ['all', ...allFYs]; // Add 'all' option
  }, [publications]);
  
  // Filter publications by selected fiscal year
  const filteredPublications = useMemo(() => {
    return filterByFiscalYear(publications, selectedFiscalYear);
  }, [publications, selectedFiscalYear]);
  
  const stats = useMemo(() => {
    const total = filteredPublications.length
    
    // Count by author (all-time entries for leaderboard)
    const authorCounts = {}
    publications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
    
    // Count by author for filtered fiscal year
    const filteredAuthorCounts = {}
    filteredPublications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      filteredAuthorCounts[author] = (filteredAuthorCounts[author] || 0) + 1
    })
    
    // Top author in selected fiscal year
    const topAuthor = Object.entries(filteredAuthorCounts).reduce((a, b) => 
      filteredAuthorCounts[a[0]] > filteredAuthorCounts[b[0]] ? a : b, ['Unknown', 0]
    )
    
    // Count Scopus indexed (for filtered fiscal year)
    const scopusCount = filteredPublications.filter(p => p.scopus).length
    
    // Calculate total impact factor for filtered fiscal year
    // Note: pub.date is the "Date of Publication" from the Excel file, not the entry/timestamp date
    const totalImpactFactor = filteredPublications.reduce((sum, pub) => {
      // Only count impact factor if publication has a valid publication date
      if (pub.date) {
        const ifValue = typeof pub.impactFactor === 'number' ? pub.impactFactor : (parseFloat(pub.impactFactor) || 0)
        return sum + ifValue
      }
      return sum
    }, 0)
    const avgImpactFactor = total > 0 ? totalImpactFactor / total : 0
    
    // Count publications with valid dates and impact factors (for filtered fiscal year)
    const publicationsWithDateAndIF = filteredPublications.filter(p => p.date && (p.impactFactor || 0) > 0)
    
    // Count by author with impact factor (all-time for leaderboard)
    const authorImpactFactors = {}
    publications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      if (!authorImpactFactors[author]) {
        authorImpactFactors[author] = { count: 0, impactFactor: 0 }
      }
      authorImpactFactors[author].count++
      authorImpactFactors[author].impactFactor += (pub.impactFactor || 0)
    })
    
    // Quarterly breakdown with impact factor
    // Quarters are calculated based on publication dates (Date of Publication), not entry dates
    const quarters = {
      Q1: { months: [6, 7, 8], name: 'Q1 (Jul-Sep)', count: 0, impactFactor: 0 },
      Q2: { months: [9, 10, 11], name: 'Q2 (Oct-Dec)', count: 0, impactFactor: 0 },
      Q3: { months: [0, 1, 2], name: 'Q3 (Jan-Mar)', count: 0, impactFactor: 0 },
      Q4: { months: [3, 4, 5], name: 'Q4 (Apr-Jun)', count: 0, impactFactor: 0 }
    }
    
    // Quarterly breakdown for filtered fiscal year
    filteredPublications.forEach(pub => {
      // Use publication date (Date of Publication) for quarterly calculations
      if (pub.date) {
        const month = pub.date.getMonth() // Month from publication date
        const impactFactor = pub.impactFactor || 0
        if ([6, 7, 8].includes(month)) {
          quarters.Q1.count++
          quarters.Q1.impactFactor += impactFactor
        } else if ([9, 10, 11].includes(month)) {
          quarters.Q2.count++
          quarters.Q2.impactFactor += impactFactor
        } else if ([0, 1, 2].includes(month)) {
          quarters.Q3.count++
          quarters.Q3.impactFactor += impactFactor
        } else if ([3, 4, 5].includes(month)) {
          quarters.Q4.count++
          quarters.Q4.impactFactor += impactFactor
        }
      }
    })
    
    return {
      total,
      topAuthor: { name: topAuthor[0], count: topAuthor[1] },
      scopusCount,
      quarters,
      authorCounts, // All-time counts for leaderboard
      totalImpactFactor,
      avgImpactFactor,
      authorImpactFactors // All-time impact factors for leaderboard
    }
  }, [filteredPublications, publications])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Analytics Dashboard
          </h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Database className="w-4 h-4 text-green-600" />
            <span>{publications.length} total publication{publications.length !== 1 ? 's' : ''} loaded</span>
            {selectedFiscalYear !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {filteredPublications.length} in {selectedFiscalYear}
              </span>
            )}
          </div>
        </div>
        
        {/* Fiscal Year Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Time</option>
            {fiscalYears.filter(fy => fy !== 'all').map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>
      </div>

      {publications.length > 0 ? (
        <>
          <Statistics stats={stats} fiscalYear={selectedFiscalYear} />
          <QuarterlyAnalysis quarters={stats.quarters} />
          <AuthorLeaderboard 
            authorCounts={stats.authorCounts} 
            authorImpactFactors={stats.authorImpactFactors}
            allTime={true}
          />
          <PublicationList 
            publications={filteredPublications} 
            allPublications={publications}
            fiscalYear={selectedFiscalYear}
          />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Database className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Publications Found</h3>
          <p className="text-gray-500">No publication data is currently available.</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard

