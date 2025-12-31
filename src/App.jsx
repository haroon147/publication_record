import React, { useState } from 'react'
import ExcelUpload from './components/ExcelUpload'
import Dashboard from './components/Dashboard'
import { Upload, FileText } from 'lucide-react'

function App() {
  const [publications, setPublications] = useState([])
  const [hasData, setHasData] = useState(false)

  const handleDataLoaded = (data) => {
    setPublications(data)
    setHasData(true)
  }

  const handleReset = () => {
    setPublications([])
    setHasData(false)
  }

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
            Period: July 1, 2024 - June 30, 2025
          </p>
        </header>

        {!hasData ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Upload Publication Data
                </h2>
                <p className="text-gray-600">
                  Upload an Excel file containing publication records to analyze
                </p>
              </div>
              <ExcelUpload onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        ) : (
          <Dashboard publications={publications} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}

export default App

