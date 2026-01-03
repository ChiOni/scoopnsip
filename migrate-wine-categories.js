/**
 * 기존 와인 데이터에 wineCategory 필드 추가
 * 30년차 바리스타의 전문성으로 와인 타입과 이름을 분석하여 카테고리 매핑
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAAIYwhWkTbCz8-1HyKTEt8AjfCwqyqqBc",
  authDomain: "scoopnsip-8948d.firebaseapp.com",
  projectId: "scoopnsip-8948d",
  storageBucket: "scoopnsip-8948d.appspot.com",
  messagingSenderId: "815208674310",
  appId: "1:815208674310:web:c33930138a5c2fdcc3bf87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 와인 이름과 타입으로 카테고리 추론
 * 30년차 바리스타의 전문 지식 기반
 */
function inferWineCategory(wine) {
  const name = (wine.name || '').toLowerCase();
  const type = wine.type || wine.wineType || '';

  // Natural wine 판별 (오렌지 와인, 내츄럴, 뱅 나뛰렐 키워드)
  const naturalKeywords = ['natural', 'nature', 'orange', 'amphora', 'skin contact', '내츄럴', '오렌지', '뱅 나뛰렐', 'vin naturel', 'bio', 'biodynamic'];
  if (naturalKeywords.some(keyword => name.includes(keyword))) {
    return 'Natural';
  }

  // Sparkling wine 판별
  const sparklingKeywords = ['champagne', 'prosecco', 'cava', 'cremant', 'sparkling', '샴페인', '스파클링', 'brut', 'spumante', 'sekt'];
  if (sparklingKeywords.some(keyword => name.includes(keyword)) || type === 'Sparkling') {
    return 'Sparkling';
  }

  // Rosé wine 판별
  const roseKeywords = ['rosé', 'rose', '로제', 'rosato'];
  if (roseKeywords.some(keyword => name.includes(keyword)) || type === 'Rosé') {
    return 'Rosé';
  }

  // White wine 판별
  const whiteKeywords = ['blanc', 'blanco', 'bianco', 'white', '화이트', '블랑', 'chardonnay', 'sauvignon blanc', 'riesling', 'pinot grigio', 'pinot gris'];
  if (whiteKeywords.some(keyword => name.includes(keyword)) || type === 'White') {
    return 'White';
  }

  // Red wine 판별 (기본값)
  const redKeywords = ['rouge', 'rosso', 'tinto', 'red', '레드', '루즈', 'cabernet', 'merlot', 'pinot noir', 'syrah', 'shiraz', 'malbec'];
  if (redKeywords.some(keyword => name.includes(keyword)) || type === 'Red') {
    return 'Red';
  }

  // 타입이 지정되어 있으면 그대로 사용
  if (type === 'Red') return 'Red';
  if (type === 'White') return 'White';
  if (type === 'Rosé') return 'Rosé';
  if (type === 'Sparkling') return 'Sparkling';

  // 기본값: Red (대부분의 와인이 레드)
  return 'Red';
}

async function migrateCategories() {
  try {
    console.log('🍷 와인 카테고리 마이그레이션 시작...\n');

    const winesRef = collection(db, 'wines');
    const snapshot = await getDocs(winesRef);

    console.log(`총 ${snapshot.size}개의 와인 발견\n`);

    let updated = 0;
    let skipped = 0;

    for (const wineDoc of snapshot.docs) {
      const wine = wineDoc.data();

      // 이미 wineCategory가 있으면 스킵
      if (wine.wineCategory) {
        console.log(`⏭️  [스킵] ${wine.name} - 이미 카테고리 있음: ${wine.wineCategory}`);
        skipped++;
        continue;
      }

      // 카테고리 추론
      const category = inferWineCategory(wine);

      // Firestore 업데이트
      const wineDocRef = doc(db, 'wines', wineDoc.id);
      await updateDoc(wineDocRef, {
        wineCategory: category
      });

      console.log(`✅ [업데이트] ${wine.name}`);
      console.log(`   타입: ${wine.type || wine.wineType || '없음'} → 카테고리: ${category}\n`);

      updated++;
    }

    console.log('\n🎉 마이그레이션 완료!');
    console.log(`✅ 업데이트: ${updated}개`);
    console.log(`⏭️  스킵: ${skipped}개`);
    console.log(`📊 총: ${snapshot.size}개`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

migrateCategories();
