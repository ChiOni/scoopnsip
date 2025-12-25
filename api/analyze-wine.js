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

    // Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
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
              text: `이 와인 사진을 분석해서 다음 정보를 JSON 형식으로 정확하게 추출해주세요${reviews ? `. 고객 후기: "${reviews}"` : ''}:

{
  "name": "와인 전체 이름 (빈티지 포함)",
  "winery": "와이너리 이름만",
  "wineryInfo": "와이너리에 대한 간단한 설명 (2-3문장, 한국어)",
  "country": "국가 (france, italy, spain, usa, chile, argentina, australia, newzealand, germany, portugal, southafrica, korea, japan 중 하나, 소문자)",
  "sweetness": 1-5 사이 숫자 (1=드라이, 5=스위트),
  "acidity": 1-5 사이 숫자,
  "body": 1-5 사이 숫자 (1=라이트, 5=풀),
  "description": "와인에 대한 설명 (향, 맛, 특징 등, 3-4문장, 한국어)"
}

라벨을 읽을 수 없다면 일반적인 와인 특성으로 추정해주세요. 반드시 JSON만 응답하세요.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API Error:', errorData);
      return res.status(response.status).json({ error: errorData.error?.message || 'AI analysis failed' });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Response content:', content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const wineData = JSON.parse(jsonMatch[0]);
    return res.status(200).json(wineData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
