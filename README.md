# SCOOPNSIP - Wine Journey 🍷

와인 컬렉션을 관리하고 AI로 자동 분석하는 웹 애플리케이션

## 🚀 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구 (빠른 HMR, 최적화된 프로덕션 빌드)
- **Zustand** - 상태 관리
- **Tailwind CSS** - 스타일링
- **Firebase Firestore** - 데이터베이스

### Backend
- **Vercel Serverless Functions** - API 엔드포인트
- **Claude 3.5 Haiku API** - AI 와인 분석 (OCR + 정보 생성)

## 📁 프로젝트 구조

```
scoopnsip/
├── src/
│   ├── components/          # UI 컴포넌트
│   │   ├── Map/            # 세계 지도 관련
│   │   ├── Wine/           # 와인 카드, 폼, 상세
│   │   ├── Filter/         # 필터 패널
│   │   └── Layout/         # 레이아웃 컴포넌트
│   ├── features/           # 기능별 모듈
│   │   └── wine-analysis/  # AI 와인 분석
│   ├── lib/                # 공통 유틸리티
│   │   ├── firebase.js     # Firebase 설정
│   │   ├── constants.js    # 상수 정의
│   │   └── utils.js        # 유틸 함수
│   ├── store/              # Zustand 스토어
│   │   ├── wineStore.js    # 와인 데이터 관리
│   │   └── filterStore.js  # 필터 상태 관리
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── main.jsx            # 엔트리 포인트
│   └── index.css           # 글로벌 스타일
├── api/                    # Vercel Serverless Functions
│   └── analyze-wine.js     # AI 와인 분석 API
├── public/                 # 정적 파일
└── dist/                   # 빌드 결과물
```

## 🛠️ 로컬 개발

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 값을 설정:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Admin Password Hash (SHA-256)
VITE_ADMIN_PASSWORD_HASH=your-password-hash
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 4. 프로덕션 빌드
```bash
npm run build
```

## 🌐 Vercel 배포

### 자동 배포
GitHub에 push하면 자동으로 Vercel에 배포됩니다.

### 환경 변수 설정 (중요!)
Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

1. Vercel 프로젝트 설정 → Environment Variables 접속
2. 다음 변수들을 추가:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_PASSWORD_HASH`

3. **Redeploy** 버튼을 눌러 환경 변수가 적용된 상태로 재배포

## 🎯 주요 기능

- ✅ 세계 지도에서 국가별 와인 관리
- ✅ AI 자동 와인 정보 입력 (Claude 3.5 Haiku)
- ✅ 와인 사진 업로드 및 OCR
- ✅ 가격, 재고 관리
- ✅ 필터링 (가격 범위, 재고 여부)
- ✅ CRUD 작업 (생성, 조회, 수정, 삭제)
- ✅ 관리자 비밀번호 인증

## 🔮 향후 계획 (AI Agent 플로우)

- [ ] AI 와인 추천 시스템
- [ ] 방문 기록 추적
- [ ] 구매 요청 자동화
- [ ] 사용자별 맞춤 추천

## 📊 아키텍처 장점

### 확장성
- 컴포넌트 기반 구조로 쉬운 기능 추가
- Feature 폴더로 AI Agent 기능 독립 관리
- Zustand로 복잡한 상태 관리 대비

### 성능
- Vite 빌드로 최적화된 번들 (Code Splitting)
- Firebase로 실시간 데이터 동기화
- 이미지 자동 압축 (800px, 0.8 quality)

### 유지보수성
- 파일당 평균 100-200줄 (기존 1225줄 단일 파일 대비)
- 명확한 폴더 구조
- 환경 변수로 설정 분리

## 🤖 Claude Code와의 협업

이 프로젝트는 Claude Code를 사용한 바이브 코딩에 최적화되어 있습니다:
- 명확한 컴포넌트 분리
- JSDoc 타입 힌트
- Feature 기반 폴더 구조
- 함수형 프로그래밍 스타일

## 📝 라이선스

MIT License
