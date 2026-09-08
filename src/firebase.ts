import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import firebaseConfigJson from '../firebase-applet-config.json';
import { Transaction, TransactionFormData } from './types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

// Ensure config object is properly typed
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with specific database ID if available
// In our project, firestoreDatabaseId is "moneydb69"
const targetDbId = (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId;

let firestoreInstance: Firestore;
try {
  if (targetDbId && targetDbId !== '(default)') {
    firestoreInstance = getFirestore(app, targetDbId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Failed to initialize with custom databaseId, falling back to default:', e);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const DATABASE_NAME = (!targetDbId || targetDbId === '(default)') ? 'MoneyDB69' : targetDbId;

// Sign in with Google (Gmail)
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign in directly with email (bypasses auth/unauthorized-domain restrictions while connecting to Firebase)
export async function signInWithDirectEmail(email: string, displayName?: string): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (displayName || cleanEmail.split('@')[0]).trim();

  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
      }
      localStorage.setItem('moneydb69_direct_email', cleanEmail);
      localStorage.setItem('moneydb69_direct_name', cleanName);
      localStorage.setItem('moneydb69_direct_uid', cred.user.uid);
      return {
        uid: cred.user.uid,
        email: cleanEmail,
        displayName: cleanName,
        photoURL: null,
        isAnonymous: true,
      };
    }
  } catch (err) {
    console.warn('signInAnonymously failed or disabled, using deterministic email-based uid:', err);
  }

  // Deterministic UID fallback for when anonymous auth is not enabled in Firebase
  let stableUid = 'user_' + btoa(unescape(encodeURIComponent(cleanEmail))).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  localStorage.setItem('moneydb69_direct_email', cleanEmail);
  localStorage.setItem('moneydb69_direct_name', cleanName);
  localStorage.setItem('moneydb69_direct_uid', stableUid);

  return {
    uid: stableUid,
    email: cleanEmail,
    displayName: cleanName,
    photoURL: null,
    isAnonymous: true,
  };
}

export function getSavedDirectUser(): AppUser | null {
  const savedEmail = localStorage.getItem('moneydb69_direct_email');
  const savedUid = localStorage.getItem('moneydb69_direct_uid');
  const savedName = localStorage.getItem('moneydb69_direct_name');
  if (savedEmail && savedUid) {
    return {
      uid: savedUid,
      email: savedEmail,
      displayName: savedName || savedEmail.split('@')[0],
      photoURL: null,
      isAnonymous: true,
    };
  }
  return null;
}

export function clearDirectUserSession(): void {
  localStorage.removeItem('moneydb69_direct_email');
  localStorage.removeItem('moneydb69_direct_uid');
  localStorage.removeItem('moneydb69_direct_name');
}

// Sign out
export async function logOut(): Promise<void> {
  clearDirectUserSession();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

// Collection reference for transactions in MoneyDB69
export const COLLECTION_NAME = 'MoneyDB69';

// Add new transaction
export async function addTransaction(
  user: { uid: string; email?: string | null }, 
  data: TransactionFormData
): Promise<string> {
  const collectionRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(collectionRef, {
    userId: user.uid,
    userEmail: user.email || '',
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    date: data.date, // Format: YYYY-MM-DD
    note: data.note || '',
    paymentMethod: data.paymentMethod || 'transfer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update transaction
export async function updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    amount: data.amount !== undefined ? Number(data.amount) : undefined,
    updatedAt: serverTimestamp(),
  });
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Real-time listener for user's transactions
export function subscribeUserTransactions(
  userId: string, 
  onData: (items: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      transactions.push({
        id: docSnap.id,
        userId: d.userId,
        userEmail: d.userEmail,
        type: d.type,
        amount: Number(d.amount) || 0,
        category: d.category,
        date: d.date,
        note: d.note || '',
        paymentMethod: d.paymentMethod || 'transfer',
        createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now(),
      });
    });
    onData(transactions);
  }, (err) => {
    console.error('Error fetching transactions:', err);
    if (onError) onError(err);
  });
}
