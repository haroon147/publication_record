import React from 'react'
import { FileText, Award, CheckCircle, TrendingUp, Star } from 'lucide-react'

const Statistics = ({ stats }) => {
  const statCards = [
    {
      icon: FileText,
      label: 'Total Publications',
      value: stats.total,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      label: 'Total Impact Factor (Jul 2024 - Jun 2025)',
      value: stats.totalImpactFactor?.toFixed(2) || '0.00',
      subValue: `Average: ${stats.avgImpactFactor?.toFixed(2) || '0.00'}`,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      highlight: true
    },
    {
      icon: Award,
      label: 'Top Contributor',
      value: stats.topAuthor.name,
      subValue: `${stats.topAuthor.count} publications`,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: CheckCircle,
      label: 'Scopus Indexed',
      value: stats.scopusCount,
      subValue: `${Math.round((stats.scopusCount / stats.total) * 100)}% of total`,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div>
      {/* Prominent Total Impact Factor Display */}
      <div className="mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-brand-600/25 transition-transform hover:-translate-y-0.5">
          <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm">
              <Star className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div className="text-right">
              <p className="text-white/85 text-sm font-medium mb-1">Total Journal Impact Factor</p>
              <p className="text-white/60 text-xs">July 1, 2024 - June 30, 2025</p>
            </div>
          </div>
          <div className="relative text-center">
            <p className="font-display text-6xl sm:text-7xl font-extrabold mb-2 tracking-tight">
              {typeof stats.totalImpactFactor === 'number' ? stats.totalImpactFactor.toFixed(2) : '0.00'}
            </p>
            <p className="text-white/85 text-lg font-medium">
              Average: {typeof stats.avgImpactFactor === 'number' ? stats.avgImpactFactor.toFixed(2) : '0.00'}
            </p>
            <p className="text-white/55 text-sm mt-3">
              Sum of Journal Impact Factors from {stats.total || 0} publication{stats.total !== 1 ? 's' : ''}
              <br />
              (Based on publication dates: July 1, 2024 - June 30, 2025)
            </p>
          </div>
        </div>
      </div>

      {/* Other Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.filter(stat => !stat.highlight).map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/85 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/70 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${stat.bgGradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
              <div className={`relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-md mb-4`}>
                <Icon className="w-5.5 h-5.5 text-white" />
              </div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1.5">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-1 truncate">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </p>
              {stat.subValue && (
                <p className="text-slate-400 text-xs">{stat.subValue}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Statistics

