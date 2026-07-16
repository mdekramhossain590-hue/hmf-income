import { getDoc, getDocs, DocumentReference, DocumentSnapshot, Query, QuerySnapshot } from '@/src/lib/mock-firestore';

const docCache = new Map<string, { snap: DocumentSnapshot, timestamp: number }>();
const queryCache = new Map<string, { snap: QuerySnapshot, timestamp: number }>();
const CACHE_DURATION_MS = 1000 * 60 * 5; // 5 minutes cache

export async function getCachedDoc(docRef: DocumentReference, forceRefresh = false): Promise<DocumentSnapshot> {
  const cacheKey = docRef.path;
  
  if (!forceRefresh) {
    const cached = docCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.snap;
    }
  }

  const snap = await getDoc(docRef);
  if (snap.exists()) {
    docCache.set(cacheKey, { snap, timestamp: Date.now() });
  }
  return snap;
}

// Basic query cache helper by creating a simple string key if we can't easily serialize the full query.
// Mostly useful when we just want to avoid immediate repeat loads on navigation within the 5 min window.
export async function getCachedQuery(queryRef: Query, cacheKey: string, forceRefresh = false): Promise<QuerySnapshot> {
  if (!forceRefresh) {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.snap;
    }
  }

  const snap = await getDocs(queryRef);
  queryCache.set(cacheKey, { snap, timestamp: Date.now() });
  return snap;
}

export function clearCache() {
  docCache.clear();
  queryCache.clear();
}
