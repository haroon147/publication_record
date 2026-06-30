import React from 'react'
import { Calendar } from 'lucide-react'

const QUARTER_DATA = [
  { key: 'Q1', color: 'from-blue-500 to-blue-600', dot: 'bg-blue-500', ring: 'ring-blue-300', months: 'July – September' },
  { key: 'Q2', color: 'from-emerald-500 to-emerald-600', dot: 'bg-emerald-500', ring: 'ring-emerald-300', months: 'October – December' },
  { key: 'Q3', color: 'from-purple-500 to-purple-600', dot: 'bg-purple-500', ring: 'ring-purple-300', months: 'January – March' },
  { key: 'Q4', color: 'from-orange-500 to-orange-600', dot: 'bg-orange-500', ring: 'ring-orange-300', months: 'April – June' },
]

const QuarterlyAnalysis = ({ quarters, selectedQuarter = 'all', onSelectQuarter }) => {
  const maxCount = Math.max(...Object.values(quarters).map(q => q.count), 1)

  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/70 p-6 sm:p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-md shadow-brand-500/30">
            <Calendar className="w-4.5 h-4.5 text-white" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quarterly Breakdown</h3>
            <p className="text-xs text-slate-400">Click a quarter to filter the dashboard</p>
          </div>
        </div>
        {selectedQuarter !== 'all' && (
          <button
            onClick={() => onSelectQuarter?.('all')}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Show All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {QUARTER_DATA.map((q) => {
          const data = quarters[q.key]
          const isActive = selectedQuarter === q.key
          const pct = maxCount > 0 ? (data.count / maxCount) * 100 : 0

          return (
            <button
              key={q.key}
              onClick={() => onSelectQuarter?.(isActive ? 'all' : q.key)}
              className={`w-full text-left space-y-2 p-3 -mx-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-50/70 ring-2 ring-brand-200'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${q.dot} ${isActive ? `ring-2 ${q.ring}` : ''}`} />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{data.name}</p>
                    <p className="text-xs text-slate-400">{q.months}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">{data.count}</p>
                  <p className="text-[0.65rem] text-slate-400 uppercase tracking-wide">publications</p>
                  {data.impactFactor > 0 && (
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">
                      IF {data.impactFactor.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${q.color} h-full rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${pct}%`, minWidth: data.count > 0 ? '20px' : '0' }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary grid */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUARTER_DATA.map((q) => {
            const data = quarters[q.key]
            const isActive = selectedQuarter === q.key
            return (
              <button
                key={q.key}
                onClick={() => onSelectQuarter?.(isActive ? 'all' : q.key)}
                className={`text-center p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-brand-50 border-brand-200 shadow-sm'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <p className={`text-xl font-bold ${isActive ? 'text-brand-700' : 'text-slate-800'}`}>
                  {data.count}
                </p>
                <p className="text-[0.65rem] text-slate-500 mt-0.5 font-semibold uppercase tracking-wide">{q.key}</p>
                {data.impactFactor > 0 && (
                  <p className="text-[0.6rem] text-brand-500 mt-0.5 font-medium">
                    IF {data.impactFactor.toFixed(1)}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuarterlyAnalysis
