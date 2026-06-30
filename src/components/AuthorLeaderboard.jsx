import React, { useMemo, useState } from 'react'
import { Trophy, Medal, Award, Star, Hash, TrendingUp } from 'lucide-react'

const LEADERBOARD_EXCLUDED_AUTHORS = ['Dr Saman Riaz', 'Dr Farrukh Arslan']

const AuthorLeaderboard = ({ publications = [] }) => {
  const [showAll, setShowAll] = useState(false)
  const [sortMode, setSortMode] = useState('count') // 'count' | 'impactFactor'

  const authorStats = useMemo(() => {
    const counts = {}
    const impact = {}
    publications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      if (LEADERBOARD_EXCLUDED_AUTHORS.includes(author)) return
      counts[author] = (counts[author] || 0) + 1
      impact[author] = (impact[author] || 0) + (pub.impactFactor || 0)
    })
    return { counts, impact }
  }, [publications])

  const sortedAuthors = useMemo(() => {
    return Object.entries(authorStats.counts)
      .map(([name, count]) => ({
        name,
        count,
        impactFactor: authorStats.impact[name] || 0,
        avgImpactFactor: authorStats.impact[name] ? authorStats.impact[name] / count : 0,
      }))
      .sort((a, b) => {
        if (sortMode === 'impactFactor') {
          if (b.impactFactor !== a.impactFactor) return b.impactFactor - a.impactFactor
          return b.count - a.count
        }
        if (b.count !== a.count) return b.count - a.count
        return b.impactFactor - a.impactFactor
      })
  }, [authorStats, sortMode])

  const displayedAuthors = showAll ? sortedAuthors : sortedAuthors.slice(0, 10)

  const maxValue = sortMode === 'impactFactor'
    ? (sortedAuthors[0]?.impactFactor || 1)
    : (sortedAuthors[0]?.count || 1)

  const getBarWidth = (author) => {
    const val = sortMode === 'impactFactor' ? author.impactFactor : author.count
    return `${(val / maxValue) * 100}%`
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-slate-400 text-sm font-bold">{index + 1}</span>
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-amber-50/80 border-amber-200'
    if (index === 1) return 'bg-slate-50 border-slate-200'
    if (index === 2) return 'bg-orange-50/70 border-orange-200'
    return 'bg-white border-slate-100'
  }

  const leader = sortedAuthors[0]

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
            <Trophy className="w-4.5 h-4.5 text-white" />
          </span>
          <h3 className="text-lg font-bold text-slate-900">Faculty Leaderboard</h3>
        </div>

        {/* Sort mode toggle */}
        <div className="ml-auto flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setSortMode('count')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortMode === 'count'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            By Count
          </button>
          <button
            onClick={() => setSortMode('impactFactor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortMode === 'impactFactor'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            By Impact Factor
          </button>
        </div>
      </div>

      {/* Mode description */}
      <p className="text-xs text-slate-400 mb-4 -mt-2">
        {sortMode === 'count'
          ? 'Ranked by number of publications. Ties broken by total impact factor.'
          : 'Ranked by total cumulative impact factor of publications.'}
      </p>

      {displayedAuthors.length === 0 ? (
        <p className="text-slate-400 text-center py-8 text-sm">No author data available</p>
      ) : (
        <div className="space-y-2.5">
          {displayedAuthors.map((author, index) => (
            <div
              key={author.name}
              className={`flex items-center gap-4 p-4 rounded-xl border ${getRankColor(index)} transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="shrink-0 w-7 flex justify-center">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate text-sm">{author.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">
                    {author.count} pub{author.count !== 1 ? 's' : ''}
                  </span>
                  {author.impactFactor > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-brand-500" />
                      <span className="text-brand-600 font-semibold">
                        IF {author.impactFactor.toFixed(2)}
                      </span>
                      <span className="text-slate-400">
                        (avg {author.avgImpactFactor.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="shrink-0 w-20">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      sortMode === 'impactFactor'
                        ? 'bg-gradient-to-r from-brand-500 to-indigo-500'
                        : 'bg-gradient-to-r from-brand-500 to-purple-500'
                    }`}
                    style={{ width: getBarWidth(author) }}
                  />
                </div>
                <p className="text-[0.6rem] text-slate-400 text-right mt-0.5">
                  {sortMode === 'impactFactor'
                    ? author.impactFactor.toFixed(1)
                    : `${author.count} pubs`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedAuthors.length > 10 && (
        <div className="mt-4 flex justify-center">
          <button
            className="text-xs font-semibold px-4 py-2 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show Top 10' : `View All ${sortedAuthors.length} Faculty`}
          </button>
        </div>
      )}

      {leader && (
        <div className="mt-5 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
          {sortMode === 'count' ? (
            <>
              <span className="font-semibold text-slate-800">{leader.name}</span> leads with{' '}
              <span className="font-semibold text-brand-600">{leader.count}</span> publication{leader.count !== 1 ? 's' : ''}
              {leader.impactFactor > 0 && (
                <span className="text-slate-400"> · IF {leader.impactFactor.toFixed(2)}</span>
              )}
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-800">{leader.name}</span> leads with cumulative IF of{' '}
              <span className="font-semibold text-brand-600">{leader.impactFactor.toFixed(2)}</span>
              {' '}across <span className="font-semibold text-slate-700">{leader.count}</span> publication{leader.count !== 1 ? 's' : ''}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AuthorLeaderboard
