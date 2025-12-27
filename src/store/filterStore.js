import { create } from 'zustand';

/**
 * 필터 상태 관리 스토어
 */
const useFilterStore = create((set, get) => ({
  // 상태
  filters: {
    priceMin: '',
    priceMax: '',
    inStockOnly: false
  },
  showFilterPanel: false,

  // 필터 업데이트
  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  // 여러 필터 한번에 업데이트
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // 모든 필터 초기화
  clearFilters: () => {
    set({
      filters: {
        priceMin: '',
        priceMax: '',
        inStockOnly: false
      }
    });
  },

  // 필터 패널 토글
  toggleFilterPanel: () => {
    set(state => ({ showFilterPanel: !state.showFilterPanel }));
  },

  // 필터 패널 닫기
  closeFilterPanel: () => {
    set({ showFilterPanel: false });
  },

  // 와인 목록에 필터 적용
  applyFilters: (wines) => {
    const { filters } = get();

    return wines.filter(wine => {
      // 가격 필터
      if (filters.priceMin && wine.price && parseInt(wine.price) < parseInt(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && wine.price && parseInt(wine.price) > parseInt(filters.priceMax)) {
        return false;
      }

      // 재고 필터
      if (filters.inStockOnly && wine.inStock === false) {
        return false;
      }

      return true;
    });
  },

  // 활성 필터 개수
  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.inStockOnly) count++;
    return count;
  },

  // 필터가 활성화되었는지 확인
  hasActiveFilters: () => {
    const { filters } = get();
    return !!(filters.priceMin || filters.priceMax || filters.inStockOnly);
  }
}));

export default useFilterStore;
