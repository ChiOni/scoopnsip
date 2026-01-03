import React from 'react';
import { formatPrice, formatDate } from '../../lib/utils';
import { COUNTRIES, WINE_CATEGORIES } from '../../lib/constants';

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
    <div className="flex flex-col h-full">
      {/* 와인 이미지 - 상단 1/3 영역 */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
        {wine.image && (
          <img
            src={wine.image}
            alt={wine.name}
            className="w-full h-full object-contain p-4"
          />
        )}
        {/* 카테고리 뱃지 오버레이 */}
        {wine.wineCategory && WINE_CATEGORIES[wine.wineCategory] && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm font-medium" style={{ color: WINE_CATEGORIES[wine.wineCategory].color }}>
              {WINE_CATEGORIES[wine.wineCategory].icon} {WINE_CATEGORIES[wine.wineCategory].name}
            </span>
          </div>
        )}
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* 헤더: 이름, 가격, 재고 (가장 중요한 정보를 상단에) */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1 leading-tight">{wine.name}</h2>
              <p className="text-base text-gray-600">{wine.winery}</p>
            </div>
            {wine.price && (
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(wine.price)}
                  <span className="text-sm font-normal text-gray-500">원</span>
                </p>
              </div>
            )}
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 flex-wrap text-sm">
            {wine.date && (
              <span className="text-gray-500">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(wine.date)}
              </span>
            )}
            {wine.country && COUNTRIES[wine.country] && (
              <span className="text-gray-600 font-medium">
                🌍 {COUNTRIES[wine.country].name}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${wine.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {wine.inStock !== false ? '✓ 재고 있음' : '품절'}
            </span>
          </div>
        </div>

        {/* 특성 (당도, 산도, 바디) - 컴팩트 카드 */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">와인 특성</h3>
          <div className="space-y-3">
            {/* 당도 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">당도</span>
                <span className="font-medium text-gray-900">{wine.sweetness}/5</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(wine.sweetness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 산도 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">산도</span>
                <span className="font-medium text-gray-900">{wine.acidity}/5</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all"
                  style={{ width: `${(wine.acidity / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 바디 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">바디</span>
                <span className="font-medium text-gray-900">{wine.body}/5</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${(wine.body / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 와이너리 정보 */}
        {wine.wineryInfo && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">와이너리</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{wine.wineryInfo}</p>
          </div>
        )}

        {/* 테이스팅 노트 */}
        {wine.description && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">테이스팅 노트</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {wine.description}
            </p>
          </div>
        )}

        {/* 고객 후기 */}
        {wine.reviews && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">고객 후기</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line italic">
                "{wine.reviews}"
              </p>
            </div>
          </div>
        )}

        {/* 수정/삭제 버튼 - 하단 고정 */}
        <div className="flex gap-3 pt-2 pb-2">
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
