import React, { useState, useMemo } from 'react'
import { FileText, Search, User, BookOpen, CheckCircle, XCircle, Star, Globe, Building2, ArrowUpDown } from 'lucide-react'
import { getQuarter } from '../utils/fiscalYear'

const COLLAB_BADGE = {
  international: { label: 'Intl. Collab', cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  national:      { label: 'Natl. Collab', cls: 'bg-teal-50 text-teal-600 border-teal-100' },
  unknown:       { label: 'Collaboration', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
}

const PublicationList = ({
  publications,
  allFacultyMembers = [],
  activeFilters = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const filteredAndSorted = useMemo(() => {
    let filtered = publications.filter(pub => {
      const matchesSearch =
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.journal && pub.journal.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFaculty = selectedFaculty === 'all' || pub.authorName === selectedFaculty

      return matchesSearch && matchesFaculty
    })

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return b.date - a.date
      }
      if (sortBy === 'impactFactor') {
        return (b.impactFactor || 0) - (a.impactFactor || 0)
      }
      if (sortBy === 'author') return a.authorName.localeCompare(b.authorName)
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return 0
    })

    return filtered
  }, [publications, searchTerm, selectedFaculty, sortBy])

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-md shadow-brand-500/30 shrink-0">
          <FileText className="w-4.5 h-4.5 text-white" />
        </span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Publication Records</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredAndSorted.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{publications.length}</span> publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search + Faculty + Sort bar */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, author, or journal…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Faculty filter */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm min-w-0 flex-1 max-w-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="bg-transparent focus:outline-none text-sm text-slate-700 w-full"
            >
              <option value="all">All Faculty Members</option>
              {allFacultyMembers.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none text-sm text-slate-700"
            >
              <option value="date">Sort: Newest First</option>
              <option value="impactFactor">Sort: Impact Factor</option>
              <option value="author">Sort: Author</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publication cards */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="text-sm font-medium">No publications match your search</p>
          <p className="text-xs mt-1 text-slate-300">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredAndSorted.map((pub, index) => {
            const q = getQuarter(pub.date)
            const collabBadge = pub.collaborationType ? COLLAB_BADGE[pub.collaborationType] : null

            return (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-100 transition-all duration-150"
              >
                <div className="flex flex-col gap-3">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-slate-900 leading-snug">{pub.title}</h4>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pub.scopus ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide">
                            <CheckCircle className="w-3 h-3" /> Scopus
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide">
                            <XCircle className="w-3 h-3" /> Not Indexed
                          </span>
                        )}
                        {pub.impactFactor > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide">
                            <Star className="w-3 h-3" /> IF {pub.impactFactor.toFixed(2)}
                          </span>
                        )}
                        {collabBadge && (
                          <span className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide ${collabBadge.cls}`}>
                            {pub.collaborationType === 'international'
                              ? <Globe className="w-3 h-3" />
                              : <Building2 className="w-3 h-3" />}
                            {collabBadge.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date + Quarter */}
                    <div className="text-right shrink-0">
                      {pub.date && (
                        <p className="text-sm font-semibold text-slate-600">{formatDate(pub.date)}</p>
                      )}
                      {q && (
                        <span className="inline-block mt-1 text-[0.65rem] font-bold px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full uppercase tracking-wide">
                          {q}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Author + Journal */}
                  <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="font-medium text-slate-700">{pub.authorName}</span>
                    </div>
                    {pub.journal && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BookOpen className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="truncate">{pub.journal}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PublicationList
