import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { FileText } from 'lucide-react'
import { publicationsData } from './data/publications'

const STORAGE_KEY = 'publication_records'

function App() {
  const [publications, setPublications] = useState([])

  // Load data on component mount - prioritize localStorage, fallback to default data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Convert date strings back to Date objects
        const publicationsWithDates = parsed.map(pub => ({
          ...pub,
          date: pub.date ? new Date(pub.date) : null
        }))
        setPublications(publicationsWithDates)
        console.log('📂 Loaded saved publications from localStorage:', publicationsWithDates.length)
      } catch (error) {
        console.error('Error loading saved data:', error)
        // Fallback to default data if localStorage fails
        setPublications(publicationsData)
      }
    } else {
      // No saved data, use default publications data
      setPublications(publicationsData)
      console.log('📂 Loaded default publications:', publicationsData.length)
      
      // Save default data to localStorage for future visits
      const dataToSave = publicationsData.map(pub => ({
        ...pub,
        date: pub.date ? pub.date.toISOString() : null
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }
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
            All Time Publication Records
          </p>
        </header>

        <Dashboard publications={publications} />
      </div>
    </div>
  )
}

export default App

