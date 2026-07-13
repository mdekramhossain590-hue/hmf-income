// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, FacebookAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import toast from "react-hot-toast";
import { firebaseConfig } from "./firebase-NEW";

// Initialize Firebase using your private dedicated project
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {});

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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let userFriendlyMessage = "An unexpected error occurred. Please try again.";
  
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as any).code;
    switch (errorCode) {
      case 'permission-denied':
        userFriendlyMessage = "You don't have permission to perform this action.";
        break;
      case 'not-found':
        userFriendlyMessage = "The requested resource was not found.";
        break;
      case 'unauthenticated':
        userFriendlyMessage = "Please sign in to continue.";
        break;
      case 'unavailable':
      case 'network-request-failed':
        userFriendlyMessage = "Network error. Please check your internet connection.";
        break;
      case 'resource-exhausted':
        userFriendlyMessage = "Quota exceeded. Please try again later.";
        break;
      case 'already-exists':
        userFriendlyMessage = "This document already exists.";
        break;
      case 'deadline-exceeded':
        userFriendlyMessage = "The operation timed out. Please try again.";
        break;
      case 'failed-precondition':
        userFriendlyMessage = "Operation failed due to system state. Please try again.";
        break;
      case 'cancelled':
        userFriendlyMessage = "The operation was cancelled.";
        break;
      default:
        userFriendlyMessage = (error as any).message || userFriendlyMessage;
    }
  } else if (error instanceof Error) {
    userFriendlyMessage = error.message;
  }

  // Display specific user-friendly message
  toast.error(userFriendlyMessage);

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
