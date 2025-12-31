import React, { useMemo } from 'react'
import Statistics from './Statistics'
import QuarterlyAnalysis from './QuarterlyAnalysis'
import AuthorLeaderboard from './AuthorLeaderboard'
import PublicationList from './PublicationList'
import { BarChart3, Database } from 'lucide-react'

const Dashboard = ({ publications }) => {
  const stats = useMemo(() => {
    const total = publications.length
    
    // Count by author
    const authorCounts = {}
    publications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
    
    const topAuthor = Object.entries(authorCounts).reduce((a, b) => 
      authorCounts[a[0]] > authorCounts[b[0]] ? a : b, ['Unknown', 0]
    )
    
    // Count Scopus indexed
    const scopusCount = publications.filter(p => p.scopus).length
    
    // Calculate total impact factor based on publication dates
    // Only publications with dates between July 1, 2024 - June 30, 2025 are included
    const totalImpactFactor = publications.reduce((sum, pub) => {
      // Only count impact factor if publication has a valid date within range
      if (pub.date) {
        const ifValue = typeof pub.impactFactor === 'number' ? pub.impactFactor : (parseFloat(pub.impactFactor) || 0)
        return sum + ifValue
      }
      return sum
    }, 0)
    const avgImpactFactor = total > 0 ? totalImpactFactor / total : 0
    
    // Count publications with valid dates and impact factors
    const publicationsWithDateAndIF = publications.filter(p => p.date && (p.impactFactor || 0) > 0)
    
    // Debug: Log impact factor calculation
    console.log('Impact Factor Calculation (based on publication dates):', {
      totalPublications: total,
      publicationsWithDates: publications.filter(p => p.date).length,
      publicationsWithImpactFactor: publicationsWithDateAndIF.length,
      totalImpactFactor: totalImpactFactor,
      avgImpactFactor: avgImpactFactor,
      dateRange: 'July 1, 2024 - June 30, 2025',
      samplePublications: publications.slice(0, 3).map(p => ({
        title: p.title.substring(0, 40),
        publicationDate: p.date ? p.date.toLocaleDateString() : 'No date',
        impactFactor: p.impactFactor || 0
      }))
    })
    
    // Count by author with impact factor
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
    const quarters = {
      Q1: { months: [6, 7, 8], name: 'Q1 (Jul-Sep)', count: 0, impactFactor: 0 },
      Q2: { months: [9, 10, 11], name: 'Q2 (Oct-Dec)', count: 0, impactFactor: 0 },
      Q3: { months: [0, 1, 2], name: 'Q3 (Jan-Mar)', count: 0, impactFactor: 0 },
      Q4: { months: [3, 4, 5], name: 'Q4 (Apr-Jun)', count: 0, impactFactor: 0 }
    }
    
    publications.forEach(pub => {
      if (pub.date) {
        const month = pub.date.getMonth()
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
  }, [publications])

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
            <span>{publications.length} publication{publications.length !== 1 ? 's' : ''} loaded</span>
          </div>
        </div>
      </div>

      {publications.length > 0 ? (
        <>
          <Statistics stats={stats} />
          <QuarterlyAnalysis quarters={stats.quarters} />
          <AuthorLeaderboard authorCounts={stats.authorCounts} authorImpactFactors={stats.authorImpactFactors} />
          <PublicationList publications={publications} />
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

