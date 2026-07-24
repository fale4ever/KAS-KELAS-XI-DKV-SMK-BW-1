import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { AppState } from '../types';
import { INITIAL_STATE } from '../data/initialData';

export const firebaseConfig = {
  apiKey: "AIzaSyALBRmCn8G70BSFcPSg18YVQo0-7uJypBU",
  authDomain: "kas-kelas-xi-dkv.firebaseapp.com",
  databaseURL: "https://kas-kelas-xi-dkv-default-rtdb.firebaseio.com",
  projectId: "kas-kelas-xi-dkv",
  storageBucket: "kas-kelas-xi-dkv.firebasestorage.app",
  messagingSenderId: "733177763633",
  appId: "1:733177763633:web:2938a4fe790680cabb0210",
  measurementId: "G-8311Y3YD8Q"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);

const KAS_REF_PATH = 'kas_kelas_xi_dkv';

export function subscribeToKasData(
  onData: (data: AppState) => void,
  onError?: (err: any) => void
) {
  const kasRef = ref(db, KAS_REF_PATH);
  
  return onValue(
    kasRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
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
        saveKasDataToFirebase(INITIAL_STATE);
        onData(INITIAL_STATE);
      }
    },
    (error) => {
      console.warn('Firebase connection warning:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveKasDataToFirebase(newState: AppState): Promise<boolean> {
  try {
    const kasRef = ref(db, KAS_REF_PATH);
    const cleanData = JSON.parse(JSON.stringify(newState));
    cleanData.adminPin = 'dkv20262027';
    await set(kasRef, cleanData);
    return true;
  } catch (error) {
    console.error('Error saving data to Firebase:', error);
    return false;
  }
}
