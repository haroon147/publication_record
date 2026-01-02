import React from 'react'
import { Trophy, Medal, Award, Star } from 'lucide-react'

const AuthorLeaderboard = ({ authorCounts, authorImpactFactors, allTime = false }) => {
  const sortedAuthors = Object.entries(authorCounts)
    .map(([name, count]) => ({ 
      name, 
      count,
      impactFactor: authorImpactFactors?.[name]?.impactFactor || 0,
      avgImpactFactor: authorImpactFactors?.[name] ? 
        (authorImpactFactors[name].impactFactor / authorImpactFactors[name].count) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-800">
          {allTime ? 'All-Time Top Contributors' : 'Top Contributors'}
        </h3>
        {allTime && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Based on all entries
          </span>
        )}
      </div>

      {sortedAuthors.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No author data available</p>
      ) : (
        <div className="space-y-3">
          {sortedAuthors.map((author, index) => (
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
                      width: `${(author.count / sortedAuthors[0].count) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
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

