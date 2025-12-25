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
    const { image, reviews, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Step 1: OCR - 라벨에서 텍스트 추출
    console.log('Step 1: Extracting text from wine label...');
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
              text: `이 와인 라벨의 모든 텍스트를 정확하게 읽어주세요. 다음 형식으로 응답하세요:

{
  "wineName": "라벨에 적힌 와인 이름 (정확하게)",
  "winery": "와이너리/생산자 이름",
  "vintage": "빈티지 연도 (있다면)",
  "wineType": "와인 타입 (Red, White, Rosé, Sparkling 중 하나, 라벨이나 와인 색상으로 판단)",
  "region": "라벨에 적힌 지역/원산지",
  "grapeVariety": "포도 품종 (있다면)",
  "otherText": "기타 중요한 텍스트"
}

반드시 JSON만 응답하세요. 추측하지 말고 라벨에서 읽을 수 있는 것만 정확히 추출하세요.`
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
    console.log('OCR Result:', labelData);

    // Step 2: Web Search - 추출한 와인 이름으로 검색
    const searchQuery = `${labelData.wineName} ${labelData.winery || ''} wine tasting notes characteristics`.trim();
    console.log('Step 2: Searching web for:', searchQuery);

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
          content: `다음 와인 정보를 기반으로 상세 정보를 제공해주세요:

라벨 정보:
- 와인 이름: ${labelData.wineName}
- 와이너리: ${labelData.winery || '알 수 없음'}
- 빈티지: ${labelData.vintage || '알 수 없음'}
- 와인 타입: ${labelData.wineType || '알 수 없음'}
- 지역: ${labelData.region || '알 수 없음'}
- 포도 품종: ${labelData.grapeVariety || '알 수 없음'}

다음 형식으로 JSON만 응답하세요:

{
  "name": "${labelData.wineName}${labelData.vintage ? ' ' + labelData.vintage : ''}",
  "winery": "${labelData.winery || ''}",
  "wineryInfo": "와이너리에 대한 간단한 설명 (2-3문장, 한국어로 작성)",
  "country": "국가 코드 (france, italy, spain, usa, chile, argentina, australia, newzealand, germany, portugal, southafrica, korea, japan 중 하나, 소문자로)",
  "sweetness": 1-5 사이 숫자 (${labelData.wineType === 'White' ? '화이트 와인 기준' : labelData.wineType === 'Red' ? '레드 와인 기준' : '일반적인 기준'}),
  "acidity": 1-5 사이 숫자,
  "body": 1-5 사이 숫자,
  "description": "이 와인의 특징, 향, 맛에 대한 설명 (3-4문장, 한국어로 작성)"
}

중요:
- 라벨에서 읽은 정보를 우선 사용하세요
- country는 지역(${labelData.region})을 참고하여 추정하세요
- ${labelData.wineType} 타입에 맞는 특성을 제공하세요
- 일반적인 와인 지식을 활용하여 합리적인 값을 제공하세요
- 모든 필드를 채워주세요 (null 금지)`
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
    console.log('Final wine data:', wineData);

    return res.status(200).json(wineData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
