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
    <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl border border-white/80 shadow-2xl shadow-blue-200/60 p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Publication Records</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredAndSorted.length} of {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {selectedFiscalYear !== 'all' && (
            <span className="text-[0.65rem] font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wider">
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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search publications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <User className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="all">All Faculty Members</option>
                {allFacultyMembers.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterQuarter}
                onChange={(e) => setFilterQuarter(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="all">All Quarters</option>
                <option value="Q1">Q1 (Jul-Sep)</option>
                <option value="Q2">Q2 (Oct-Dec)</option>
                <option value="Q3">Q3 (Jan-Mar)</option>
                <option value="Q4">Q4 (Apr-Jun)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-gray-500 text-sm">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="date">Date</option>
                <option value="author">Author</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty directory</span>
          {allFacultyMembers.slice(0, 12).map(faculty => (
            <button
              key={faculty}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                selectedFaculty === faculty
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedFaculty(faculty)}
            >
              {faculty}
            </button>
          ))}
          {allFacultyMembers.length > 12 && (
            <span className="text-xs text-slate-400">+{allFacultyMembers.length - 12} more</span>
          )}
        </div>
      </div>

      {/* Publication List */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No publications found matching your filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSorted.map((pub, index) => (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-transform duration-150"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{pub.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs uppercase tracking-wider text-slate-500">
                      {pub.scopus && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Scopus
                        </span>
                      )}
                      {!pub.scopus && (
                        <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Not Indexed
                        </span>
                      )}
                      {pub.impactFactor > 0 && (
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          IF {pub.impactFactor.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {pub.date && (
                      <p className="text-sm font-semibold text-gray-600">
                        {formatDate(pub.date)}
                      </p>
                    )}
                    {pub.date && (
                      <span className="text-[0.65rem] font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full uppercase tracking-wide">
                        {getQuarter(pub.date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{pub.authorName}</span>
                  </div>
                  {pub.journal && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-gray-400" />
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

