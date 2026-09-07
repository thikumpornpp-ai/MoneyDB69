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
  signInWithCredential
} from 'firebase/auth';
import firebaseConfigJson from '../firebase-applet-config.json';
import { Transaction, TransactionFormData } from './types';

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
export const DATABASE_NAME = targetDbId || 'MoneyDB69';

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

// Sign out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Collection reference for transactions in MoneyDB69
export const COLLECTION_NAME = 'MoneyDB69';

// Add new transaction
export async function addTransaction(user: User, data: TransactionFormData): Promise<string> {
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
