import React, { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, User, BookOpen, CheckCircle, XCircle, Star } from 'lucide-react'

const PublicationList = ({ publications, allPublications, fiscalYear }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterQuarter, setFilterQuarter] = useState('all')
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [sortBy, setSortBy] = useState('date') // date, author, title

  // Get all unique faculty members from all publications (for filter dropdown)
  const uniqueAuthors = useMemo(() => {
    const allAuthors = allPublications || publications
    const authors = [...new Set(allAuthors.map(p => p.authorName))].sort()
    return authors
  }, [allPublications, publications])

  const getQuarter = (date) => {
    if (!date) return null
    const month = date.getMonth()
    if ([6, 7, 8].includes(month)) return 'Q1'
    if ([9, 10, 11].includes(month)) return 'Q2'
    if ([0, 1, 2].includes(month)) return 'Q3'
    if ([3, 4, 5].includes(month)) return 'Q4'
    return null
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', { 
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

      // Author filter
      const matchesAuthor = filterAuthor === 'all' || pub.authorName === filterAuthor

      return matchesSearch && matchesQuarter && matchesAuthor
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
  }, [publications, searchTerm, filterQuarter, filterAuthor, sortBy])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">All Publications</h3>
        <span className="ml-auto text-sm text-gray-500">
          {filteredAndSorted.length} of {publications.length} publications
        </span>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quarter Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Quarters</option>
              <option value="Q1">Q1 (Jul-Sep)</option>
              <option value="Q2">Q2 (Oct-Dec)</option>
              <option value="Q3">Q3 (Jan-Mar)</option>
              <option value="Q4">Q4 (Apr-Jun)</option>
            </select>
          </div>

          {/* Author Filter */}
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Authors</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="author">Sort by Author</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Publication List */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No publications found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((pub, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                    {pub.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{pub.authorName}</span>
                    </div>
                    {pub.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(pub.date)}</span>
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {getQuarter(pub.date)}
                        </span>
                      </div>
                    )}
                    {pub.journal && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{pub.journal}</span>
                      </div>
                    )}
                    {pub.impactFactor > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-indigo-600">IF: {pub.impactFactor.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                  {pub.scopus ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">Scopus</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400">
                      <XCircle className="w-5 h-5" />
                      <span className="text-xs">Not Indexed</span>
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

