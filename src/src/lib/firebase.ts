import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AppState } from '../types';
import { INITIAL_STATE } from '../data/initialData';

// Konfigurasi Firebase dari pengguna
export const firebaseConfig = {
  apiKey: "AIzaSyALBRmCn8G70BSFcPSg18YVQo0-7uJypBU",
  authDomain: "kas-kelas-xi-dkv.firebaseapp.com",
  projectId: "kas-kelas-xi-dkv",
  storageBucket: "kas-kelas-xi-dkv.firebasestorage.app",
  messagingSenderId: "733177763633",
  appId: "1:733177763633:web:2938a4fe790680cabb0210",
  measurementId: "G-8311Y3YD8Q"
};

// Inisialisasi Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Cloud Firestore
export const db = getFirestore(app);

const COLLECTION_NAME = 'kas_data';
const DOC_NAME = 'kas_kelas_xi_dkv';

/**
 * Langganan update data kas secara realtime dari Cloud Firestore
 */
export function subscribeToKasData(
  onData: (data: AppState) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, COLLECTION_NAME, DOC_NAME);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data();
        const sanitized: AppState = {
          ...INITIAL_STATE,
          ...val,
          students: val.students || INITIAL_STATE.students,
          weeks: val.weeks || INITIAL_STATE.weeks,
          payments: val.payments || {},
          expenses: val.expenses || [],
          adminPin: 'dkv20262027',
        };
        onData(sanitized);
      } else {
        // Jika dokumen di Firestore belum ada, otomatis upload data awal ke Firestore
        saveKasDataToFirebase(INITIAL_STATE);
        onData(INITIAL_STATE);
      }
    },
    (error) => {
      console.warn('Cloud Firestore connection warning:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Menyimpan/memperbarui data kas ke Cloud Firestore
 */
export async function saveKasDataToFirebase(newState: AppState): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_NAME);
    const cleanData = JSON.parse(JSON.stringify(newState));
    cleanData.adminPin = 'dkv20262027';
    await setDoc(docRef, cleanData);
    return true;
  } catch (error) {
    console.error('Error saving data to Firestore:', error);
    return false;
  }
}

/**
 * Upload manual data awal ke Cloud Firestore
 */
export async function uploadInitialDataToFirestore(): Promise<boolean> {
  return await saveKasDataToFirebase(INITIAL_STATE);
}
