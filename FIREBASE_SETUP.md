# Firebase 설정 가이드

## 🔥 Firebase Storage 권한 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. `scoopnsip-c89e2` 프로젝트 선택
3. **Storage** 메뉴 클릭
4. **Rules** 탭 선택
5. 아래 규칙으로 변경:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

6. **게시** 버튼 클릭

---

## 📄 Firestore Database 권한 설정

1. Firebase Console에서 **Firestore Database** 메뉴 클릭
2. **규칙** 탭 선택
3. 아래 규칙으로 변경:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

4. **게시** 버튼 클릭

---

## ⚠️ 보안 주의사항

현재 설정은 **개발/테스트 환경**용입니다.
프로덕션 환경에서는 적절한 인증 및 권한 규칙을 설정해야 합니다.

---

## 🧪 연결 테스트

1. 웹사이트 접속
2. 브라우저 개발자 도구 (F12) 열기
3. Console 탭에서 다음 확인:
   - "Firebase 초기화 상태" 메시지
   - 에러 없이 데이터 로드

4. 국가 선택 → + 버튼 → 비밀번호 입력 (231015) → 와인 정보 입력
5. 저장 버튼 클릭 후 Console에서 저장 과정 확인

---

## 🐛 문제 해결

### "storage/unauthorized" 에러
→ Storage Rules 설정 확인

### "permission-denied" 에러
→ Firestore Rules 설정 확인

### 로딩만 계속 돌아가는 경우
→ Console에서 에러 메시지 확인
→ Firebase 프로젝트 설정 확인
