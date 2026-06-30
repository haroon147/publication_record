import React from 'react'
import { FileText, Award, CheckCircle, TrendingUp, Star, Globe, Building2, BookMarked } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, subValue, gradientFrom, gradientTo }) => (
  <div className="group relative overflow-hidden bg-white/85 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-200/70 transition-all hover:-translate-y-1 hover:shadow-lg">
    <div
      className="absolute -top-8 -right-8 w-24 h-24 opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"
      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
    />
    <div
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-md mb-3"
      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mb-0.5 truncate">{value}</p>
    {subValue && <p className="text-slate-400 text-xs">{subValue}</p>}
  </div>
)

const Statistics = ({ stats }) => {
  const scopusPct = stats.total > 0 ? Math.round((stats.scopusCount / stats.total) * 100) : 0
  const ifNonScopusPct = stats.total > 0 ? Math.round(((stats.ifNonScopusCount || 0) / stats.total) * 100) : 0
  const nonIfPct = stats.total > 0 ? Math.round(((stats.nonIfCount || 0) / stats.total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Hero Impact Factor Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-brand-600/25 transition-transform hover:-translate-y-0.5">
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

        <div className="relative flex items-start justify-between mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm">
            <Star className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <div className="text-right">
            <p className="text-white/85 text-sm font-medium">Total Journal Impact Factor</p>
            <p className="text-white/55 text-xs mt-0.5">Across all filtered publications</p>
          </div>
        </div>

        <div className="relative text-center">
          <p className="font-display text-6xl sm:text-7xl font-extrabold mb-2 tracking-tight">
            {typeof stats.totalImpactFactor === 'number' ? stats.totalImpactFactor.toFixed(2) : '0.00'}
          </p>
          <p className="text-white/85 text-lg font-medium">
            Avg per publication: {typeof stats.avgImpactFactor === 'number' ? stats.avgImpactFactor.toFixed(2) : '0.00'}
          </p>
          <p className="text-white/55 text-sm mt-2">
            From {stats.total || 0} publication{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Total Publications"
          value={stats.total}
          subValue={stats.total > 0 ? `${stats.scopusCount} Scopus · ${stats.total - stats.scopusCount} Non-Scopus` : '—'}
          gradientFrom="#3b82f6"
          gradientTo="#2563eb"
        />
        <StatCard
          icon={Award}
          label="Top Contributor"
          value={stats.topAuthor.name || '—'}
          subValue={stats.topAuthor.count ? `${stats.topAuthor.count} publications` : '—'}
          gradientFrom="#a855f7"
          gradientTo="#7c3aed"
        />
        <StatCard
          icon={TrendingUp}
          label="Highest Impact Factor"
          value={stats.avgImpactFactor > 0 ? stats.totalImpactFactor.toFixed(1) : '0'}
          subValue={`Avg IF: ${typeof stats.avgImpactFactor === 'number' ? stats.avgImpactFactor.toFixed(2) : '0.00'}`}
          gradientFrom="#f59e0b"
          gradientTo="#d97706"
        />
      </div>

      {/* RSCI Category Breakdown */}
      <div className="bg-white/85 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
            <BookMarked className="w-4 h-4 text-white" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">RSCI Category Breakdown</h3>
            <p className="text-xs text-slate-400">Research performance by publication type</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Scopus Indexed */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Scopus Indexed</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{stats.scopusCount}</p>
            <p className="text-xs text-emerald-500 mt-0.5">{scopusPct}% of total</p>
          </div>

          {/* IF Non-Scopus */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">IF Non-Scopus</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.ifNonScopusCount || 0}</p>
            <p className="text-xs text-blue-400 mt-0.5">{ifNonScopusPct}% of total</p>
          </div>

          {/* Non-IF / HEC */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Non-IF / HEC</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.nonIfCount || 0}</p>
            <p className="text-xs text-purple-400 mt-0.5">{nonIfPct}% of total</p>
          </div>

          {/* International Collaboration */}
          <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Intl. Collaboration</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.intlCollabCount || 0}</p>
            <p className="text-xs text-orange-400 mt-0.5">Foreign author papers</p>
          </div>

          {/* National Collaboration */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Natl. Collaboration</span>
            </div>
            <p className="text-2xl font-bold text-teal-600">{stats.natCollabCount || 0}</p>
            <p className="text-xs text-teal-400 mt-0.5">Pakistan university partners</p>
          </div>

          {/* Citation per paper placeholder */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg IF per Paper</span>
            </div>
            <p className="text-2xl font-bold text-slate-600">
              {typeof stats.avgImpactFactor === 'number' ? stats.avgImpactFactor.toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Cumulative impact factor avg</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
