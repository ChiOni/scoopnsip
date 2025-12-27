import React from 'react';
import { formatDate } from '../../lib/utils';

/**
 * 와인 카드 컴포넌트 (리스트 아이템)
 */
function WineCard({ wine, onClick }) {
  const getTypeColor = (type) => {
    const colors = {
      'Red': 'bg-red-100 text-red-700',
      'White': 'bg-yellow-100 text-yellow-700',
      'Rosé': 'bg-pink-100 text-pink-700',
      'Sparkling': 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className="wine-card px-4 py-4 cursor-pointer flex items-start gap-4"
    >
      {/* 와인 이미지 */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={wine.image}
          alt={wine.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 와인 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{wine.name}</h3>
        <p className="text-sm text-gray-500 truncate">{wine.winery}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(wine.wineType)}`}>
            {wine.wineType}
          </span>
          <span className="text-xs text-gray-400">{formatDate(wine.date)}</span>
        </div>
      </div>

      {/* 화살표 */}
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default WineCard;
