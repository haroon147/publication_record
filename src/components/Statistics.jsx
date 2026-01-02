import React from 'react'
import { FileText, Award, CheckCircle, TrendingUp, Star } from 'lucide-react'

const Statistics = ({ stats, fiscalYear }) => {
  const getFiscalYearLabel = (fy) => {
    if (!fy || fy === 'all') return 'All Time'
    const match = fy.match(/FY-(\d{2})-(\d{2})/);
    if (match) {
      const startYY = match[1];
      const endYY = match[2];
      return `FY ${startYY}-${endYY}`;
    }
    return fy;
  };
  
  const getDateRange = (fy) => {
    if (!fy || fy === 'all') return 'All Publications'
    const match = fy.match(/FY-(\d{2})-(\d{2})/);
    if (match) {
      const startYY = parseInt(match[1]);
      const endYY = parseInt(match[2]);
      const startYear = startYY < 50 ? 2000 + startYY : 1900 + startYY;
      const endYear = endYY < 50 ? 2000 + endYY : 1900 + endYY;
      return `July 1, ${startYear} - June 30, ${endYear}`;
    }
    return 'All Publications';
  };
  const statCards = [
    {
      icon: FileText,
      label: 'Total Publications',
      value: stats.total,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      label: `Total Impact Factor (${getFiscalYearLabel(fiscalYear)})`,
      value: stats.totalImpactFactor?.toFixed(2) || '0.00',
      subValue: `Average: ${stats.avgImpactFactor?.toFixed(2) || '0.00'}`,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      highlight: true
    },
    {
      icon: Award,
      label: 'Top Contributor',
      value: stats.topAuthor.name,
      subValue: `${stats.topAuthor.count} publications`,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: CheckCircle,
      label: 'Scopus Indexed',
      value: stats.scopusCount,
      subValue: `${Math.round((stats.scopusCount / stats.total) * 100)}% of total`,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div>
      {/* Prominent Total Impact Factor Display */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-2xl transform hover:scale-102 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-12 h-12 text-white opacity-90" />
            <div className="text-right">
              <p className="text-white opacity-90 text-sm mb-2">Total Journal Impact Factor</p>
              <p className="text-white opacity-75 text-xs">{getDateRange(fiscalYear)}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">
              {typeof stats.totalImpactFactor === 'number' ? stats.totalImpactFactor.toFixed(2) : '0.00'}
            </p>
            <p className="text-white opacity-80 text-lg">
              Average: {typeof stats.avgImpactFactor === 'number' ? stats.avgImpactFactor.toFixed(2) : '0.00'}
            </p>
            <p className="text-white opacity-60 text-sm mt-2">
              Sum of Journal Impact Factors from {stats.total || 0} publication{stats.total !== 1 ? 's' : ''} 
              <br />
              (Based on publication dates: {getDateRange(fiscalYear)})
            </p>
          </div>
        </div>
      </div>

      {/* Other Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.filter(stat => !stat.highlight).map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${stat.bgGradient} rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-white opacity-90" />
              </div>
              <p className="text-white opacity-90 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold mb-1">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </p>
              {stat.subValue && (
                <p className="text-white opacity-75 text-xs">{stat.subValue}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Statistics

