/**
 * SHA-256 해시 생성
 * @param {string} str - 해시할 문자열
 * @returns {Promise<string>} 해시 값
 */
export async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 이미지를 Base64로 변환
 * @param {File} file - 이미지 파일
 * @returns {Promise<{base64: string, preview: string}>}
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      const preview = reader.result;
      resolve({ base64, preview });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 날짜 포맷팅
 * @param {string|number|Date} date - 날짜
 * @returns {string} 포맷된 날짜 (YYYY-MM-DD)
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * 가격 포맷팅 (천 단위 콤마)
 * @param {number|string} price - 가격
 * @returns {string} 포맷된 가격
 */
export function formatPrice(price) {
  if (!price) return '';
  return parseInt(price).toLocaleString();
}
