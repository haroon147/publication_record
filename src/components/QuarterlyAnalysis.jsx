import React from 'react'
import { Calendar, BarChart } from 'lucide-react'

const QuarterlyAnalysis = ({ quarters }) => {
  const maxCount = Math.max(...Object.values(quarters).map(q => q.count))
  const maxImpactFactor = Math.max(...Object.values(quarters).map(q => q.impactFactor || 0))
  
  const quarterData = [
    { key: 'Q1', data: quarters.Q1, color: 'bg-blue-500', months: 'July - September' },
    { key: 'Q2', data: quarters.Q2, color: 'bg-green-500', months: 'October - December' },
    { key: 'Q3', data: quarters.Q3, color: 'bg-purple-500', months: 'January - March' },
    { key: 'Q4', data: quarters.Q4, color: 'bg-orange-500', months: 'April - June' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Quarterly Breakdown</h3>
      </div>

      <div className="space-y-4">
        {quarterData.map((quarter) => (
          <div key={quarter.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{quarter.data.name}</p>
                <p className="text-sm text-gray-500">{quarter.months}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{quarter.data.count}</p>
                <p className="text-xs text-gray-500">publications</p>
                {quarter.data.impactFactor > 0 && (
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    IF: {quarter.data.impactFactor.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`${quarter.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{
                  width: maxCount > 0 ? `${(quarter.data.count / maxCount) * 100}%` : '0%',
                  minWidth: quarter.data.count > 0 ? '20px' : '0%'
                }}
              >
                {quarter.data.count > 0 && (
                  <span className="text-white text-xs font-medium">
                    {Math.round((quarter.data.count / maxCount) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {quarterData.map((quarter) => (
            <div key={quarter.key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{quarter.data.count}</p>
              <p className="text-xs text-gray-600 mt-1">{quarter.key}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quarterData.map((quarter) => (
            <div key={`${quarter.key}-if`} className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-800">{quarter.data.impactFactor?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-indigo-600 mt-1">Impact Factor</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuarterlyAnalysis

