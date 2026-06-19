import React from 'react'
import { Calendar, BarChart } from 'lucide-react'

const QuarterlyAnalysis = ({ quarters }) => {
  const maxCount = Math.max(...Object.values(quarters).map(q => q.count))
  const maxImpactFactor = Math.max(...Object.values(quarters).map(q => q.impactFactor || 0))
  
  const quarterData = [
    { key: 'Q1', data: quarters.Q1, color: 'from-blue-500 to-blue-600', dot: 'bg-blue-500', months: 'July - September' },
    { key: 'Q2', data: quarters.Q2, color: 'from-emerald-500 to-emerald-600', dot: 'bg-emerald-500', months: 'October - December' },
    { key: 'Q3', data: quarters.Q3, color: 'from-purple-500 to-purple-600', dot: 'bg-purple-500', months: 'January - March' },
    { key: 'Q4', data: quarters.Q4, color: 'from-orange-500 to-orange-600', dot: 'bg-orange-500', months: 'April - June' }
  ]

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-md shadow-brand-500/30">
          <Calendar className="w-4.5 h-4.5 text-white" />
        </span>
        <h3 className="text-lg font-bold text-slate-900">Quarterly Breakdown</h3>
      </div>

      <div className="space-y-5">
        {quarterData.map((quarter) => (
          <div key={quarter.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${quarter.dot}`} />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{quarter.data.name}</p>
                  <p className="text-xs text-slate-400">{quarter.months}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-800">{quarter.data.count}</p>
                <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">publications</p>
                {quarter.data.impactFactor > 0 && (
                  <p className="text-xs font-semibold text-brand-600 mt-0.5">
                    IF: {quarter.data.impactFactor.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${quarter.color} h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                style={{
                  width: maxCount > 0 ? `${(quarter.data.count / maxCount) * 100}%` : '0%',
                  minWidth: quarter.data.count > 0 ? '24px' : '0%'
                }}
              >
                {quarter.data.count > 0 && (
                  <span className="text-white text-[0.65rem] font-semibold">
                    {Math.round((quarter.data.count / maxCount) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {quarterData.map((quarter) => (
            <div key={quarter.key} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xl font-bold text-slate-800">{quarter.data.count}</p>
              <p className="text-[0.65rem] text-slate-500 mt-0.5 font-medium uppercase tracking-wide">{quarter.key}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quarterData.map((quarter) => (
            <div key={`${quarter.key}-if`} className="text-center p-3 bg-brand-50 rounded-xl border border-brand-100/70">
              <p className="text-xl font-bold text-brand-700">{quarter.data.impactFactor?.toFixed(2) || '0.00'}</p>
              <p className="text-[0.65rem] text-brand-500 mt-0.5 font-medium uppercase tracking-wide">Impact Factor</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuarterlyAnalysis

