/**
 * 국가별 와인 마커 설정
 */
export const COUNTRIES = {
  france: { name: '프랑스', x: 49, y: 30, color: '#DC2626' },
  italy: { name: '이탈리아', x: 51, y: 32, color: '#059669' },
  spain: { name: '스페인', x: 48, y: 35, color: '#D97706' },
  usa: { name: '미국', x: 29, y: 35, color: '#2563EB' },
  chile: { name: '칠레', x: 34.5, y: 68, color: '#7C3AED' },
  argentina: { name: '아르헨티나', x: 36, y: 72, color: '#DB2777' },
  australia: { name: '호주', x: 77, y: 67, color: '#0891B2' },
  newzealand: { name: '뉴질랜드', x: 81, y: 80, color: '#65A30D' },
  germany: { name: '독일', x: 51, y: 30, color: '#F59E0B' },
  portugal: { name: '포르투갈', x: 47, y: 36, color: '#EC4899' },
  southafrica: { name: '남아공', x: 53, y: 69, color: '#8B5CF6' },
  korea: { name: '한국', x: 72, y: 34, color: '#10B981' },
  japan: { name: '일본', x: 74, y: 34, color: '#EF4444' }
};

/**
 * 와인 타입별 설정
 */
export const WINE_TYPES = {
  Red: { name: '레드', color: '#DC2626' },
  White: { name: '화이트', color: '#F59E0B' },
  Rosé: { name: '로제', color: '#EC4899' },
  Sparkling: { name: '스파클링', color: '#8B5CF6' }
};

/**
 * 관리자 비밀번호 해시 (환경 변수에서 가져오거나 기본값 사용)
 */
export const PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || '1c8fe0ec46c4d990dc9d51da05b35d284fe86d9f0841777b4cf8a3a3284c16e9';
