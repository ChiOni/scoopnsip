import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

/**
 * Firebase 설정 (환경 변수에서 가져옴)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firestore 컬렉션 참조
 */
const winesCollection = collection(db, 'wines');

/**
 * 모든 와인 데이터 가져오기
 * @returns {Promise<Array>} 와인 배열
 */
export async function getAllWines() {
  const snapshot = await getDocs(winesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 새 와인 추가
 * @param {Object} wineData - 와인 데이터
 * @returns {Promise<string>} 생성된 와인 ID
 */
export async function addWine(wineData) {
  const docRef = await addDoc(winesCollection, wineData);
  return docRef.id;
}

/**
 * 와인 수정
 * @param {string} wineId - 와인 ID
 * @param {Object} updates - 업데이트할 데이터
 */
export async function updateWine(wineId, updates) {
  const wineDoc = doc(db, 'wines', wineId);
  await updateDoc(wineDoc, updates);
}

/**
 * 와인 삭제
 * @param {string} wineId - 와인 ID
 */
export async function deleteWine(wineId) {
  const wineDoc = doc(db, 'wines', wineId);
  await deleteDoc(wineDoc);
}

export { db };
