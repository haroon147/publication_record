import React, { useMemo, useState } from 'react'
import Statistics from './Statistics'
import QuarterlyAnalysis from './QuarterlyAnalysis'
import AuthorLeaderboard from './AuthorLeaderboard'
import PublicationList from './PublicationList'
import { BarChart3, Database, Filter } from 'lucide-react'
import { getAllFiscalYears, filterByFiscalYear } from '../utils/fiscalYear'

const Dashboard = ({ publications }) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('all')

  // Get all unique faculty members (authors) from ALL publications
  const allFacultyMembers = useMemo(() => {
    const authors = [...new Set(publications.map(p => p.authorName))].sort()
    return authors
  }, [publications])

  // Get all available fiscal years from ALL publications
  const availableFiscalYears = useMemo(() => {
    const fiscalYears = getAllFiscalYears(publications)
    console.log('📅 Available fiscal years:', fiscalYears)
    console.log('📊 Total publications:', publications.length)
    return fiscalYears
  }, [publications])

  // Filter publications based on fiscal year only
  // Faculty filtering is now handled in PublicationList component
  const filteredPublications = useMemo(() => {
    const filtered = filterByFiscalYear(publications, selectedFiscalYear)
    console.log(`🔍 Filtered publications: ${filtered.length} of ${publications.length} (Fiscal Year: ${selectedFiscalYear})`)
    return filtered
  }, [publications, selectedFiscalYear])

  const stats = useMemo(() => {
    const total = filteredPublications.length
    
    // Count by author (from filtered publications)
    const authorCounts = {}
    filteredPublications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
    
    const topAuthor = Object.entries(authorCounts).reduce((a, b) => 
      authorCounts[a[0]] > authorCounts[b[0]] ? a : b, ['Unknown', 0]
    )
    
    // Count Scopus indexed (from filtered publications)
    const scopusCount = filteredPublications.filter(p => p.scopus).length
    
    // Calculate total impact factor from filtered publications (based on publication dates)
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
    
    // Count publications with valid dates and impact factors (from filtered publications)
    const publicationsWithDateAndIF = filteredPublications.filter(p => p.date && (p.impactFactor || 0) > 0)
    
    // Count by author with impact factor (from filtered publications)
    const authorImpactFactors = {}
    filteredPublications.forEach(pub => {
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
      authorCounts,
      totalImpactFactor,
      avgImpactFactor,
      authorImpactFactors
    }
  }, [filteredPublications])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-md shadow-brand-500/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </span>
            Analytics Dashboard
          </h2>
          <div className="flex items-center gap-2 mt-2.5 text-sm text-slate-500">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>{publications.length} total publication{publications.length !== 1 ? 's' : ''} loaded</span>
            {filteredPublications.length !== publications.length && (
              <span className="text-brand-600 font-medium">
                ({filteredPublications.length} filtered)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4.5 h-4.5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Fiscal Year Filter */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Fiscal Year
            </label>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            >
              <option value="all">All Fiscal Years</option>
              {availableFiscalYears.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {publications.length > 0 ? (
        <>
          <Statistics stats={stats} />
          <QuarterlyAnalysis quarters={stats.quarters} />
          <AuthorLeaderboard
            publications={publications}
            fiscalYears={availableFiscalYears}
            allTime={true}
          />
          <PublicationList
            publications={publications}
            selectedFiscalYear={selectedFiscalYear}
            allFiscalYears={availableFiscalYears}
            allFacultyMembers={allFacultyMembers}
          />
        </>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-12 text-center">
          <Database className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Publications Found</h3>
          <p className="text-slate-400 text-sm">No publication data is currently available.</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard

