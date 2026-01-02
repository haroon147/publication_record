import React, { useMemo, useState } from 'react'
import { Trophy, Medal, Award, Star } from 'lucide-react'
import { filterByFiscalYear } from '../utils/fiscalYear'

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
    if (index === 0) return 'bg-yellow-50 border-yellow-200'
    if (index === 1) return 'bg-gray-50 border-gray-200'
    if (index === 2) return 'bg-amber-50 border-amber-200'
    return 'bg-white border-gray-200'
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-white/70">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">
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
            className="text-[0.65rem] px-3 py-1 border border-slate-200 rounded-full bg-white focus:outline-none"
          >
            <option value="all">All Fiscal Years</option>
            {fiscalYears.map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>
      </div>

      {displayedAuthors.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No author data available</p>
      ) : (
        <div className="space-y-3">
          {displayedAuthors.map((author, index) => (
            <div
              key={author.name}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankColor(index)} transition-all hover:shadow-md`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{author.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500">{author.count} publication{author.count !== 1 ? 's' : ''}</p>
                  {author.impactFactor > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 text-indigo-500" />
                      <span className="text-indigo-600 font-medium">
                        IF: {author.impactFactor.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        (avg: {author.avgImpactFactor.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
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
            className="text-sm px-3 py-1 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
            onClick={() => setShowAll(value => !value)}
          >
            {showAll ? 'Show Top 10' : 'View All Faculty'}
          </button>
        </div>
      )}

      {sortedAuthors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold text-gray-800">{sortedAuthors[0].name}</span> leads with{' '}
            <span className="font-semibold text-blue-600">{sortedAuthors[0].count}</span> publication{sortedAuthors[0].count !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default AuthorLeaderboard

