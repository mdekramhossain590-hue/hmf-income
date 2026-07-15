import { callApi } from './api';

export const initializeFirestore = () => ({});
export const getFirestore = () => ({});
export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});

export class FieldPath {
  constructor(public fieldNames: string[]) {}
}
export const serverTimestamp = () => new Date().toISOString();
export const increment = (n: number) => ({ __op: 'increment', amount: n });
export const arrayUnion = (...elements: any[]) => ({ __op: 'arrayUnion', elements });
export const deleteField = () => ({ __op: 'deleteField' });

export const collection = (db: any, path: string) => {
  return { path, type: 'collection' };
};

export const doc = (dbOrColl: any, ...paths: string[]) => {
  if (typeof dbOrColl === 'string') {
    return { path: dbOrColl + '/' + paths.join('/'), type: 'doc' };
  }
  if (dbOrColl.type === 'collection') {
    return { path: dbOrColl.path + (paths.length ? '/' + paths.join('/') : ''), type: 'doc' };
  }
  return { path: paths.join('/'), type: 'doc' };
};

export const getDoc = async (docRef: any) => {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts.slice(1).join('/');
  
  const res = await callApi('getDoc', { collection: coll, id });
  return {
    exists: () => res.exists,
    id: id,
    data: () => res.data
  };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts.slice(1).join('/');
  
  if (options?.merge) {
    await callApi('updateDoc', { collection: coll, id, data });
  } else {
    await callApi('setDoc', { collection: coll, id, data });
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts.slice(1).join('/');
  
  await callApi('updateDoc', { collection: coll, id, data });
};

export const deleteDoc = async (docRef: any) => {
  const parts = docRef.path.split('/');
  const coll = parts[0];
  const id = parts.slice(1).join('/');
  
  await callApi('deleteDoc', { collection: coll, id });
};

export const addDoc = async (collRef: any, data: any) => {
  const res = await callApi('addDoc', { collection: collRef.path, data });
  return { id: res.id, path: `${collRef.path}/${res.id}` };
};

export const query = (collRef: any, ...constraints: any[]) => {
  const filters: any[] = [];
  let order: any = null;
  let lim: number = 100;

  constraints.forEach(c => {
    if (c.type === 'where') filters.push(c);
    if (c.type === 'orderBy') order = c;
    if (c.type === 'limit') lim = c.limit;
  });

  return { path: collRef.path, filters, orderBy: order, limit: lim, type: 'query' };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, dir: string = 'asc') => {
  return { type: 'orderBy', field, dir };
};

export const limit = (n: number) => {
  return { type: 'limit', limit: n };
};

export const getDocs = async (queryRef: any) => {
  let res;
  if (queryRef.type === 'collection') {
    res = await callApi('query', { collection: queryRef.path });
  } else {
    res = await callApi('query', { 
      collection: queryRef.path,
      filters: queryRef.filters,
      orderBy: queryRef.orderBy,
      limit: queryRef.limit
    });
  }

  const docs = res.docs.map((d: any) => ({
    id: d.id,
    data: () => d.data,
    exists: () => true
  }));

  return {
    empty: docs.length === 0,
    size: docs.length,
    docs,
    forEach: (cb: any) => docs.forEach(cb)
  };
};

export const getCountFromServer = async (queryRef: any) => {
  const snap = await getDocs(queryRef);
  return {
    data: () => ({ count: snap.size })
  };
};

export const onSnapshot = (ref: any, callback: any) => {
  if (ref.type === 'doc') {
    getDoc(ref).then(callback);
  } else {
    getDocs(ref).then(callback);
  }
  return () => {}; 
};

export const writeBatch = (db: any) => {
  const operations: any[] = [];
  return {
    set: (docRef: any, data: any, options?: any) => {
      operations.push({ op: 'set', ref: docRef, data, options });
    },
    update: (docRef: any, data: any) => {
      operations.push({ op: 'update', ref: docRef, data });
    },
    delete: (docRef: any) => {
      operations.push({ op: 'delete', ref: docRef });
    },
    commit: async () => {
      for (const op of operations) {
        if (op.op === 'set') await setDoc(op.ref, op.data, op.options);
        if (op.op === 'update') await updateDoc(op.ref, op.data);
        if (op.op === 'delete') await deleteDoc(op.ref);
      }
    }
  };
};
