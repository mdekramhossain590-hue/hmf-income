import { initializeApp } from "./mock-app";
import { getAuth } from "./mock-auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "./mock-firestore";
import toast from "react-hot-toast";

const app = initializeApp({});
export const auth = getAuth(app);
export const db = initializeFirestore();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let userFriendlyMessage = "An unexpected error occurred. Please try again.";
  if (error instanceof Error) {
    userFriendlyMessage = error.message;
  }
  toast.error(userFriendlyMessage);
  throw error;
}
