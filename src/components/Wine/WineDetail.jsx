import React from 'react';
import { formatPrice, formatDate } from '../../lib/utils';
import { COUNTRIES } from '../../lib/constants';

/**
 * 와인 상세 정보 컴포넌트
 */
function WineDetail({ wine, onEdit, onDelete, onBack }) {
  if (!wine) return null;

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
    <div>
      {/* 와인 이미지 */}
      <img
        src={wine.image}
        alt={wine.name}
        className="w-full object-cover"
        style={{ aspectRatio: '1' }}
      />

      {/* 와인 정보 */}
      <div className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          {wine.date && (
            <p className="text-sm text-gray-500 mb-1">최초 판매: {formatDate(wine.date)}</p>
          )}
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">{wine.name}</h2>
          <p className="text-lg text-gray-600">{wine.winery}</p>

          {/* 국가 및 와인 타입 */}
          <div className="flex items-center gap-2 mt-3">
            {wine.country && COUNTRIES[wine.country] && (
              <span className="text-sm text-gray-600">
                {COUNTRIES[wine.country].name}
              </span>
            )}
            {wine.wineType && (
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(wine.wineType)}`}>
                {wine.wineType}
              </span>
            )}
          </div>
        </div>

        {/* 와이너리 정보 */}
        {wine.wineryInfo && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">와이너리</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{wine.wineryInfo}</p>
          </div>
        )}

        {/* 특성 (당도, 산도, 바디) */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">특성</h3>
          <div className="space-y-3">
            {/* 당도 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">당도</span>
                <span className="font-medium">{wine.sweetness}/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(wine.sweetness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 산도 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">산도</span>
                <span className="font-medium">{wine.acidity}/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${(wine.acidity / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 바디 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">바디</span>
                <span className="font-medium">{wine.body}/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(wine.body / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 테이스팅 노트 */}
        {wine.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">테이스팅 노트</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {wine.description}
            </p>
          </div>
        )}

        {/* 고객 후기 */}
        {wine.reviews && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">고객 후기</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line italic">
                {wine.reviews}
              </p>
            </div>
          </div>
        )}

        {/* 가격 및 재고 */}
        <div className="grid grid-cols-2 gap-4">
          {wine.price && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">가격</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(wine.price)}원
              </p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">재고</h3>
            <p className={`text-sm font-medium ${wine.inStock !== false ? 'text-green-600' : 'text-red-600'}`}>
              {wine.inStock !== false ? '✓ 재고 있음' : '✕ 품절'}
            </p>
          </div>
        </div>

        {/* 수정/삭제 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onEdit}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default WineDetail;
