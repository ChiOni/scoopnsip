import { create } from 'zustand';
import { getAllWines, addWine, updateWine, deleteWine } from '../lib/firebase';

/**
 * 와인 데이터 관리 스토어
 */
const useWineStore = create((set, get) => ({
  // 상태
  wines: [],
  loading: true,
  saving: false,

  // 와인 목록 로드
  loadWines: async () => {
    set({ loading: true });
    try {
      const wines = await getAllWines();
      set({ wines, loading: false });
    } catch (error) {
      console.error('Failed to load wines:', error);
      set({ loading: false });
    }
  },

  // 와인 추가
  addWine: async (wineData) => {
    set({ saving: true });
    try {
      const wineId = await addWine(wineData);
      const newWine = { id: wineId, ...wineData };
      set(state => ({ wines: [...state.wines, newWine], saving: false }));
      return wineId;
    } catch (error) {
      console.error('Failed to add wine:', error);
      set({ saving: false });
      throw error;
    }
  },

  // 와인 수정
  updateWine: async (wineId, updates) => {
    set({ saving: true });
    try {
      await updateWine(wineId, updates);
      set(state => ({
        wines: state.wines.map(w => w.id === wineId ? { ...w, ...updates } : w),
        saving: false
      }));
    } catch (error) {
      console.error('Failed to update wine:', error);
      set({ saving: false });
      throw error;
    }
  },

  // 와인 삭제
  deleteWine: async (wineId) => {
    set({ saving: true });
    try {
      await deleteWine(wineId);
      set(state => ({
        wines: state.wines.filter(w => w.id !== wineId),
        saving: false
      }));
    } catch (error) {
      console.error('Failed to delete wine:', error);
      set({ saving: false });
      throw error;
    }
  },

  // 국가별 와인 가져오기
  getWinesByCountry: (country) => {
    return get().wines.filter(w => w.country === country);
  },

  // 특정 와인 가져오기
  getWineById: (wineId) => {
    return get().wines.find(w => w.id === wineId);
  }
}));

export default useWineStore;
