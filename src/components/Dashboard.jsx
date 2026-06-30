import React, { useMemo, useState } from 'react'
import Statistics from './Statistics'
import QuarterlyAnalysis from './QuarterlyAnalysis'
import AuthorLeaderboard from './AuthorLeaderboard'
import PublicationList from './PublicationList'
import { BarChart3, Database, Filter, X, ChevronDown } from 'lucide-react'
import { getAllFiscalYears, filterByFiscalYear, getQuarter } from '../utils/fiscalYear'

const QUARTER_OPTIONS = [
  { value: 'all', label: 'All Quarters' },
  { value: 'Q1', label: 'Q1', sub: 'Jul–Sep' },
  { value: 'Q2', label: 'Q2', sub: 'Oct–Dec' },
  { value: 'Q3', label: 'Q3', sub: 'Jan–Mar' },
  { value: 'Q4', label: 'Q4', sub: 'Apr–Jun' },
]

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Types', color: 'slate' },
  { value: 'scopus', label: 'Scopus Indexed', color: 'emerald' },
  { value: 'if_non_scopus', label: 'IF Non-Scopus', color: 'blue' },
  { value: 'non_if', label: 'Non-IF / HEC', color: 'purple' },
  { value: 'international', label: 'Intl. Collaboration', color: 'orange' },
  { value: 'national', label: 'Natl. Collaboration', color: 'teal' },
]

const CATEGORY_COLOR_MAP = {
  slate:   { pill: 'bg-slate-100 text-slate-700 border-slate-200', active: 'bg-slate-700 text-white border-slate-700' },
  emerald: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600' },
  blue:    { pill: 'bg-blue-50 text-blue-700 border-blue-200', active: 'bg-blue-600 text-white border-blue-600' },
  purple:  { pill: 'bg-purple-50 text-purple-700 border-purple-200', active: 'bg-purple-600 text-white border-purple-600' },
  orange:  { pill: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  teal:    { pill: 'bg-teal-50 text-teal-700 border-teal-200', active: 'bg-teal-600 text-white border-teal-600' },
}

const Dashboard = ({ publications }) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('all')
  const [selectedQuarter, setSelectedQuarter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const allFacultyMembers = useMemo(() => {
    return [...new Set(publications.map(p => p.authorName))].sort()
  }, [publications])

  const availableFiscalYears = useMemo(() => getAllFiscalYears(publications), [publications])

  const filteredPublications = useMemo(() => {
    let filtered = filterByFiscalYear(publications, selectedFiscalYear)

    if (selectedQuarter !== 'all') {
      filtered = filtered.filter(pub => getQuarter(pub.date) === selectedQuarter)
    }

    if (selectedCategory === 'scopus') {
      filtered = filtered.filter(p => p.scopus)
    } else if (selectedCategory === 'if_non_scopus') {
      filtered = filtered.filter(p => !p.scopus && p.impactFactor > 0)
    } else if (selectedCategory === 'non_if') {
      filtered = filtered.filter(p => !p.impactFactor || p.impactFactor === 0)
    } else if (selectedCategory === 'international') {
      filtered = filtered.filter(p => p.collaborationType === 'international')
    } else if (selectedCategory === 'national') {
      filtered = filtered.filter(p => p.collaborationType === 'national')
    }

    return filtered
  }, [publications, selectedFiscalYear, selectedQuarter, selectedCategory])

  const stats = useMemo(() => {
    const total = filteredPublications.length

    const authorCounts = {}
    filteredPublications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })

    const topAuthor = Object.entries(authorCounts).reduce(
      (a, b) => (authorCounts[a[0]] > authorCounts[b[0]] ? a : b),
      ['Unknown', 0]
    )

    const scopusCount = filteredPublications.filter(p => p.scopus).length
    const ifNonScopusCount = filteredPublications.filter(p => !p.scopus && p.impactFactor > 0).length
    const nonIfCount = filteredPublications.filter(p => !p.impactFactor || p.impactFactor === 0).length
    const intlCollabCount = filteredPublications.filter(p => p.collaborationType === 'international').length
    const natCollabCount = filteredPublications.filter(p => p.collaborationType === 'national').length

    const totalImpactFactor = filteredPublications.reduce((sum, pub) => {
      if (pub.date) {
        return sum + (typeof pub.impactFactor === 'number' ? pub.impactFactor : (parseFloat(pub.impactFactor) || 0))
      }
      return sum
    }, 0)
    const avgImpactFactor = total > 0 ? totalImpactFactor / total : 0

    const authorImpactFactors = {}
    filteredPublications.forEach(pub => {
      const author = pub.authorName || 'Unknown'
      if (!authorImpactFactors[author]) {
        authorImpactFactors[author] = { count: 0, impactFactor: 0 }
      }
      authorImpactFactors[author].count++
      authorImpactFactors[author].impactFactor += (pub.impactFactor || 0)
    })

    const quarters = {
      Q1: { months: [6, 7, 8], name: 'Q1 (Jul-Sep)', count: 0, impactFactor: 0 },
      Q2: { months: [9, 10, 11], name: 'Q2 (Oct-Dec)', count: 0, impactFactor: 0 },
      Q3: { months: [0, 1, 2], name: 'Q3 (Jan-Mar)', count: 0, impactFactor: 0 },
      Q4: { months: [3, 4, 5], name: 'Q4 (Apr-Jun)', count: 0, impactFactor: 0 },
    }

    filteredPublications.forEach(pub => {
      if (pub.date) {
        const month = pub.date.getMonth()
        const if_ = pub.impactFactor || 0
        if ([6, 7, 8].includes(month)) { quarters.Q1.count++; quarters.Q1.impactFactor += if_ }
        else if ([9, 10, 11].includes(month)) { quarters.Q2.count++; quarters.Q2.impactFactor += if_ }
        else if ([0, 1, 2].includes(month)) { quarters.Q3.count++; quarters.Q3.impactFactor += if_ }
        else if ([3, 4, 5].includes(month)) { quarters.Q4.count++; quarters.Q4.impactFactor += if_ }
      }
    })

    return {
      total, topAuthor: { name: topAuthor[0], count: topAuthor[1] },
      scopusCount, ifNonScopusCount, nonIfCount, intlCollabCount, natCollabCount,
      quarters, authorCounts, totalImpactFactor, avgImpactFactor, authorImpactFactors,
    }
  }, [filteredPublications])

  const hasActiveFilters = selectedFiscalYear !== 'all' || selectedQuarter !== 'all' || selectedCategory !== 'all'

  const clearFilters = () => {
    setSelectedFiscalYear('all')
    setSelectedQuarter('all')
    setSelectedCategory('all')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
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
              <span className="text-brand-600 font-semibold">
                · {filteredPublications.length} shown
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 border border-brand-100">
              <Filter className="w-3.5 h-3.5 text-brand-600" />
            </span>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Row 1: Fiscal Year */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[200px] flex-1 max-w-xs">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Fiscal Year
              </label>
              <div className="relative">
                <select
                  value={selectedFiscalYear}
                  onChange={(e) => setSelectedFiscalYear(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow cursor-pointer"
                >
                  <option value="all">All Fiscal Years</option>
                  {availableFiscalYears.map(fy => (
                    <option key={fy} value={fy}>{fy}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Quarter pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Quarter
            </label>
            <div className="flex flex-wrap gap-2">
              {QUARTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedQuarter(opt.value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedQuarter === opt.value
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {opt.label}
                  {opt.sub && (
                    <span className={`ml-1.5 text-xs ${selectedQuarter === opt.value ? 'text-white/75' : 'text-slate-400'}`}>
                      {opt.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Publication Category pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Publication Type <span className="text-slate-400 font-normal normal-case">(RSCI Categories)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(opt => {
                const colors = CATEGORY_COLOR_MAP[opt.color]
                const isActive = selectedCategory === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedCategory(opt.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isActive ? colors.active + ' shadow-sm' : colors.pill + ' hover:opacity-80'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Active filter summary badges */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-medium">Active:</span>
            {selectedFiscalYear !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full font-semibold">
                {selectedFiscalYear}
                <button onClick={() => setSelectedFiscalYear('all')} className="hover:text-brand-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedQuarter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-semibold">
                {QUARTER_OPTIONS.find(q => q.value === selectedQuarter)?.label}
                <button onClick={() => setSelectedQuarter('all')} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full font-semibold">
                {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {publications.length > 0 ? (
        <>
          <Statistics stats={stats} />
          <QuarterlyAnalysis quarters={stats.quarters} selectedQuarter={selectedQuarter} onSelectQuarter={setSelectedQuarter} />
          <AuthorLeaderboard publications={filteredPublications} />
          <PublicationList
            publications={filteredPublications}
            allFacultyMembers={allFacultyMembers}
            activeFilters={{ fiscalYear: selectedFiscalYear, quarter: selectedQuarter, category: selectedCategory }}
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
