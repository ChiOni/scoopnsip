/**
 * 마제스틱 샤르도네 카테고리 수정 (Red → White)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

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

async function fixMajesticChardonnay() {
  try {
    const winesRef = collection(db, 'wines');
    const q = query(winesRef, where('name', '==', '마제스틱 샤르도네'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('와인을 찾을 수 없습니다.');
      process.exit(1);
    }

    const wineDoc = snapshot.docs[0];
    const wineDocRef = doc(db, 'wines', wineDoc.id);

    await updateDoc(wineDocRef, {
      wineCategory: 'White'
    });

    console.log('✅ 마제스틱 샤르도네 카테고리 수정 완료: Red → White');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

fixMajesticChardonnay();
