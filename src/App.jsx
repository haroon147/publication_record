import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { BookMarked, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen relative overflow-x-hidden bg-[#f4f6fb]">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-brand-300/30 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-0 w-[24rem] h-[24rem] bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-[40rem] left-1/3 w-[22rem] h-[22rem] bg-sky-200/30 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/70">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-lg shadow-brand-600/30 shrink-0">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Publication Record Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              University Publication Analytics System
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Live Records
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Dashboard publications={publications} />
      </main>

      <footer className="container mx-auto px-4 sm:px-6 pb-8 pt-4 text-center text-xs text-slate-400">
        Complete Publication Records Database
      </footer>
    </div>
  )
}

export default App

