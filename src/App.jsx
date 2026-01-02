import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { FileText } from 'lucide-react'
import { publicationsData } from './data/publications'

const STORAGE_KEY = 'publication_records'

function App() {
  const [publications, setPublications] = useState([])

  // Load data on component mount - always use the latest data from publications.js
  // This ensures we always have the most up-to-date data after regenerating from Excel
  useEffect(() => {
    // Always use the latest data from publications.js file
    // Ensure dates are proper Date objects (they should be from publications.js, but verify)
    const publicationsWithDates = publicationsData.map(pub => {
      let date = pub.date
      // If date is not a Date object, try to convert it
      if (date && !(date instanceof Date)) {
        date = new Date(date)
        if (isNaN(date.getTime())) {
          date = null
        }
      }
      return {
        ...pub,
        date: date
      }
    })
    setPublications(publicationsWithDates)
    console.log('📂 Loaded publications from data file:', publicationsWithDates.length)
    console.log('📊 Publications with dates:', publicationsWithDates.filter(p => p.date).length)
    console.log('📊 Publications without dates:', publicationsWithDates.filter(p => !p.date).length)
    
    // Update localStorage with the latest data
    const dataToSave = publicationsWithDates.map(pub => ({
      ...pub,
      date: pub.date ? pub.date.toISOString() : null
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    console.log('💾 Saved updated data to localStorage')
  }, [])


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Publication Record Portal
          </h1>
          <p className="text-gray-600 text-lg">
            University Publication Analytics System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Complete Publication Records Database
          </p>
        </header>

        <Dashboard publications={publications} />
      </div>
    </div>
  )
}

export default App

