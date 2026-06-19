import React, { useMemo, useState } from 'react'
import { Trophy, Medal, Award, Star } from 'lucide-react'
import { filterByFiscalYear } from '../utils/fiscalYear'

// Former faculty - excluded from the leaderboard but still kept in publication records
const LEADERBOARD_EXCLUDED_AUTHORS = ['Dr Saman Riaz', 'Dr Farrukh Arslan']

const AuthorLeaderboard = ({
  publications = [],
  fiscalYears = [],
  allTime = false
}) => {
  const [showAll, setShowAll] = useState(false)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('all')

  const visiblePublications = useMemo(
    () => filterByFiscalYear(publications, selectedFiscalYear),
    [publications, selectedFiscalYear]
  )

  const authorStats = useMemo(() => {
    const counts = {}
    const impact = {}
    visiblePublications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      if (LEADERBOARD_EXCLUDED_AUTHORS.includes(author)) return
      counts[author] = (counts[author] || 0) + 1
      impact[author] = (impact[author] || 0) + (pub.impactFactor || 0)
    })
    return { counts, impact }
  }, [visiblePublications])

  const sortedAuthors = useMemo(() => {
    return Object.entries(authorStats.counts)
      .map(([name, count]) => ({
        name,
        count,
        impactFactor: authorStats.impact[name] || 0,
        avgImpactFactor: authorStats.impact[name]
          ? authorStats.impact[name] / count
          : 0
      }))
      .sort((a, b) => {
        // First sort by publication count (descending)
        if (b.count !== a.count) {
          return b.count - a.count
        }
        // If counts are equal, sort by impact factor (descending)
        return b.impactFactor - a.impactFactor
      })
  }, [authorStats])

  const displayedAuthors = showAll ? sortedAuthors : sortedAuthors.slice(0, 10)

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">{index + 1}</span>
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-amber-50/80 border-amber-200'
    if (index === 1) return 'bg-slate-50 border-slate-200'
    if (index === 2) return 'bg-orange-50/70 border-orange-200'
    return 'bg-white border-slate-100'
  }

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
            <Trophy className="w-4.5 h-4.5 text-white" />
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            {allTime ? 'All-Time Top Contributors' : 'Top Contributors'}
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          <span className="text-[0.65rem] px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            {selectedFiscalYear === 'all' ? 'All Fiscal Years' : selectedFiscalYear}
          </span>
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="text-[0.65rem] px-3 py-1 border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Fiscal Years</option>
            {fiscalYears.map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>
      </div>

      {displayedAuthors.length === 0 ? (
        <p className="text-slate-400 text-center py-8 text-sm">No author data available</p>
      ) : (
        <div className="space-y-2.5">
          {displayedAuthors.map((author, index) => (
            <div
              key={author.name}
              className={`flex items-center gap-4 p-4 rounded-xl border ${getRankColor(index)} transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate text-sm">{author.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <p className="text-xs text-slate-400">{author.count} publication{author.count !== 1 ? 's' : ''}</p>
                  {author.impactFactor > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-brand-500" />
                      <span className="text-brand-600 font-medium">
                        IF: {author.impactFactor.toFixed(2)}
                      </span>
                      <span className="text-slate-400">
                        (avg: {author.avgImpactFactor.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(author.count / (sortedAuthors[0]?.count || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedAuthors.length > 10 && (
        <div className="mt-4 flex justify-end">
          <button
            className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
            onClick={() => setShowAll(value => !value)}
          >
            {showAll ? 'Show Top 10' : 'View All Faculty'}
          </button>
        </div>
      )}

      {sortedAuthors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500 text-center">
            <span className="font-semibold text-slate-800">{sortedAuthors[0].name}</span> leads with{' '}
            <span className="font-semibold text-brand-600">{sortedAuthors[0].count}</span> publication{sortedAuthors[0].count !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default AuthorLeaderboard

