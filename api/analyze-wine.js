export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, wineName, reviews, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!wineName) {
      return res.status(400).json({ error: 'Wine name is required' });
    }

    // Step 1: 이미지에서 추가 정보 추출 (와인 타입, 빈티지, 지역 등)
    console.log('Step 1: Extracting additional info from wine label...');
    const ocrResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image
              }
            },
            {
              type: 'text',
              text: `이 와인 라벨에서 다음 정보를 추출해주세요. 와인 이름은 "${wineName}" 입니다.

다음 형식으로 JSON만 응답하세요:

{
  "winery": "와이너리/생산자 이름",
  "vintage": "빈티지 연도 (YYYY 형식, 없으면 빈 문자열)",
  "wineType": "와인 타입 (Red, White, Rosé, Sparkling 중 하나, 라벨이나 와인 색상으로 정확히 판단)",
  "region": "라벨에 적힌 지역/원산지 (예: Bordeaux, Napa Valley)",
  "grapeVariety": "포도 품종 (있다면)"
}

반드시 JSON만 응답하세요.`
            }
          ]
        }]
      })
    });

    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json();
      console.error('OCR Error:', errorData);
      return res.status(ocrResponse.status).json({ error: 'OCR failed: ' + (errorData.error?.message || 'Unknown error') });
    }

    const ocrData = await ocrResponse.json();
    const ocrContent = ocrData.content[0].text;
    const ocrMatch = ocrContent.match(/\{[\s\S]*\}/);
    if (!ocrMatch) {
      console.error('OCR content:', ocrContent);
      return res.status(500).json({ error: 'Failed to parse OCR response' });
    }

    const labelData = JSON.parse(ocrMatch[0]);
    console.log('Extracted label data:', labelData);
    console.log('Wine name from user:', wineName);
    console.log('Wine type from image:', labelData.wineType);

    // Step 2: 사용자 입력 와인 이름 + 추출된 정보로 상세 정보 생성
    console.log('Step 2: Generating wine details for:', wineName);

    const searchResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `"${wineName}" 와인에 대한 상세 정보를 제공해주세요.

라벨에서 추출한 정보:
- 와이너리: ${labelData.winery || '알 수 없음'}
- 빈티지: ${labelData.vintage || '알 수 없음'}
- 이미지에서 판단한 타입: ${labelData.wineType || '알 수 없음'}
- 지역: ${labelData.region || '알 수 없음'}
- 포도 품종: ${labelData.grapeVariety || '알 수 없음'}

**중요**: 와인 이름 "${wineName}"을 분석하세요:
- "블랑(Blanc)" 포함 → White
- "루즈(Rouge)" 포함 → Red
- "로제(Rosé)" 포함 → Rosé
- 와인 이름이 최우선 판단 근거입니다!

다음 형식으로 JSON만 응답하세요:

{
  "name": "${wineName}",
  "winery": "${labelData.winery || '와이너리 이름'}",
  "wineryInfo": "와이너리에 대한 간단한 설명 (2-3문장, 한국어)",
  "country": "국가 코드 (france, italy, spain, usa, chile, argentina, australia, newzealand, germany, portugal, southafrica, korea, japan 중 하나, 소문자)",
  "wineType": "와인 타입 (와인 이름에서 판단: Blanc→White, Rouge→Red, Rosé→Rosé)",
  "sweetness": 1-5 숫자 (와인 타입에 맞게),
  "acidity": 1-5 숫자 (와인 타입에 맞게),
  "body": 1-5 숫자 (와인 타입에 맞게),
  "description": "이 와인의 특징, 향, 맛 설명 (3-4문장, 한국어, 와인 타입에 맞게)"
}

필수 규칙:
1. 와인 이름에 "블랑(Blanc)"이 있으면 → wineType: "White", 화이트 와인 특성으로 설명
2. 와인 이름에 "루즈(Rouge)"가 있으면 → wineType: "Red", 레드 와인 특성으로 설명
3. 이미지 정보는 참고만 하고, 와인 이름이 최종 판단 기준
4. 지역 정보(${labelData.region || '알 수 없음'})를 기반으로 country 판단
5. 모든 필드 필수 입력`
        }]
      })
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('Search Error:', errorData);
      return res.status(searchResponse.status).json({ error: 'Search failed: ' + (errorData.error?.message || 'Unknown error') });
    }

    const searchData = await searchResponse.json();
    const searchContent = searchData.content[0].text;
    const searchMatch = searchContent.match(/\{[\s\S]*\}/);
    if (!searchMatch) {
      console.error('Search content:', searchContent);
      return res.status(500).json({ error: 'Failed to parse search response' });
    }

    const wineData = JSON.parse(searchMatch[0]);
    console.log('=== AI 분석 완료 ===');
    console.log('사용자 입력 와인 이름:', wineName);
    console.log('AI 판단 와인 타입:', wineData.wineType);
    console.log('근거 - 와인 이름에 블랑 포함:', wineName.toLowerCase().includes('블랑') || wineName.toLowerCase().includes('blanc'));
    console.log('근거 - 이미지에서 추출한 타입:', labelData.wineType);
    console.log('Final wine data:', wineData);

    return res.status(200).json(wineData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
