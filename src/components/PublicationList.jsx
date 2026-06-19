import React, { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, User, BookOpen, CheckCircle, XCircle, Star } from 'lucide-react'

const PublicationList = ({ 
  publications, 
  selectedFiscalYear, 
  allFiscalYears = [],
  allFacultyMembers = []
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterQuarter, setFilterQuarter] = useState('all')
  const [selectedFaculty, setSelectedFaculty] = useState('all')
  const [sortBy, setSortBy] = useState('date') // date, author, title

  const uniqueAuthors = useMemo(() => {
    const authors = [...new Set(publications.map(p => p.authorName))].sort()
    return authors
  }, [publications])

  const getQuarter = (date) => {
    if (!date) return null
    // Validate that date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return null
    }
    const month = dateObj.getMonth()
    if ([6, 7, 8].includes(month)) return 'Q1'
    if ([9, 10, 11].includes(month)) return 'Q2'
    if ([0, 1, 2].includes(month)) return 'Q3'
    if ([3, 4, 5].includes(month)) return 'Q4'
    return null
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    // Validate that date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'N/A'
    }
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const filteredAndSorted = useMemo(() => {
    let filtered = publications.filter(pub => {
      // Search filter
      const matchesSearch = 
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.journal && pub.journal.toLowerCase().includes(searchTerm.toLowerCase()))

      // Quarter filter
      const matchesQuarter = filterQuarter === 'all' || getQuarter(pub.date) === filterQuarter

      // Faculty filter
      const matchesFaculty = selectedFaculty === 'all' || pub.authorName === selectedFaculty

      return matchesSearch && matchesQuarter && matchesFaculty
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return b.date - a.date // Newest first
      }
      if (sortBy === 'author') {
        return a.authorName.localeCompare(b.authorName)
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return filtered
  }, [publications, searchTerm, filterQuarter, selectedFaculty, sortBy])

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-md shadow-brand-500/30 shrink-0">
          <FileText className="w-4.5 h-4.5 text-white" />
        </span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Publication Records</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Showing {filteredAndSorted.length} of {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {selectedFiscalYear !== 'all' && (
            <span className="text-[0.65rem] font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-full uppercase tracking-wider">
              {selectedFiscalYear}
            </span>
          )}
          {selectedFaculty !== 'all' && (
            <span className="text-[0.65rem] font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full uppercase tracking-wider">
              {selectedFaculty}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search publications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="bg-transparent focus:outline-none text-sm text-slate-700"
              >
                <option value="all">All Faculty Members</option>
                {allFacultyMembers.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterQuarter}
                onChange={(e) => setFilterQuarter(e.target.value)}
                className="bg-transparent focus:outline-none text-sm text-slate-700"
              >
                <option value="all">All Quarters</option>
                <option value="Q1">Q1 (Jul-Sep)</option>
                <option value="Q2">Q2 (Oct-Dec)</option>
                <option value="Q3">Q3 (Jan-Mar)</option>
                <option value="Q4">Q4 (Apr-Jun)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-slate-400 text-sm">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-sm text-slate-700"
              >
                <option value="date">Date</option>
                <option value="author">Author</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Publication List */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="text-sm">No publications found matching your filters</p>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filteredAndSorted.map((pub, index) => (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-100 transition-all duration-150"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">{pub.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2.5 text-[0.65rem] uppercase tracking-wider">
                      {pub.scopus && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Scopus
                        </span>
                      )}
                      {!pub.scopus && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1 font-semibold">
                          <XCircle className="w-3 h-3" />
                          Not Indexed
                        </span>
                      )}
                      {pub.impactFactor > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100 font-semibold">
                          IF {pub.impactFactor.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {pub.date && (
                      <p className="text-sm font-semibold text-slate-600">
                        {formatDate(pub.date)}
                      </p>
                    )}
                    {pub.date && (
                      <span className="inline-block mt-1 text-[0.65rem] font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full uppercase tracking-wide">
                        {getQuarter(pub.date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-300" />
                    <span className="font-medium text-slate-700">{pub.authorName}</span>
                  </div>
                  {pub.journal && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-300" />
                      <span>{pub.journal}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicationList

