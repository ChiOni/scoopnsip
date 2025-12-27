import React from 'react';
import useFilterStore from '../../store/filterStore';
import useWineStore from '../../store/wineStore';

/**
 * 필터 패널 컴포넌트 (Instagram 스타일)
 */
function FilterPanel() {
  const { filters, setFilter, clearFilters, closeFilterPanel } = useFilterStore();
  const wines = useWineStore(state => state.wines);
  const filteredCount = useFilterStore(state => state.applyFilters(wines).length);

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/20 z-40 fade-in"
        onClick={closeFilterPanel}
      />

      {/* 필터 패널 */}
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 drawer scale-in">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-serif text-xl font-semibold text-gray-900">필터</h2>
            <button
              onClick={closeFilterPanel}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 필터 옵션 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 가격 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">가격 범위</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="최소"
                  value={filters.priceMin}
                  onChange={(e) => setFilter('priceMin', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="최대"
                  value={filters.priceMax}
                  onChange={(e) => setFilter('priceMax', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            {/* 재고 여부 토글 */}
            <div>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-700">재고 있는 와인만</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilter('inStockOnly', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition ${filters.inStockOnly ? 'bg-purple-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.inStockOnly ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                </div>
              </label>
            </div>

            {/* 모든 필터 초기화 */}
            {(filters.priceMin || filters.priceMax || filters.inStockOnly) && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition"
                >
                  모든 필터 초기화
                </button>
              </div>
            )}
          </div>

          {/* 하단 통계 */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              필터링된 와인: {filteredCount}개 / 전체: {wines.length}개
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default FilterPanel;
