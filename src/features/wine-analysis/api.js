/**
 * AI 와인 분석 API 호출
 * @param {Object} params - 분석 파라미터
 * @param {string} params.image - Base64 이미지
 * @param {string} params.wineName - 와인 이름
 * @param {string} params.reviews - 사용자 리뷰 (선택)
 * @param {string} params.apiKey - Claude API 키
 * @returns {Promise<Object>} 분석 결과
 */
export async function analyzeWine({ image, wineName, reviews = '', apiKey }) {
  const response = await fetch('/api/analyze-wine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image,
      wineName,
      reviews,
      apiKey
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI 분석에 실패했습니다');
  }

  return response.json();
}
