import { callApi } from './api';

export const getAuth = (app?: any) => {
  return {
    currentUser: JSON.parse(localStorage.getItem('mock_user') || 'null'),
  };
};

export const onAuthStateChanged = (auth: any, cb: any) => {
  const user = JSON.parse(localStorage.getItem('mock_user') || 'null');
  cb(user);
  return () => {};
};

export const signOut = (auth: any) => {
  localStorage.removeItem('mock_user');
  window.location.reload();
};

export const signInWithEmailAndPassword = async (auth: any, email: string, pass: string) => {
  try {
    const res = await callApi('auth_login', { email, password: pass });
    const user = { uid: res.uid, email: res.email };
    localStorage.setItem('mock_user', JSON.stringify(user));
    window.location.reload();
    return { user };
  } catch (err: any) {
    if (err.message?.includes('User-not-found') || err.message?.includes('Invalid password')) {
      err.code = 'auth/invalid-credential';
    }
    throw err;
  }
};

export const createUserWithEmailAndPassword = async (auth: any, email: string, pass: string) => {
  try {
    const res = await callApi('auth_register', { email, password: pass });
    const user = { uid: res.uid, email: res.email };
    localStorage.setItem('mock_user', JSON.stringify(user));
    window.location.reload();
    return { user };
  } catch (err: any) {
    if (err.message?.includes('already in use')) {
      err.code = 'auth/email-already-in-use';
    }
    throw err;
  }
};

export const signInWithPopup = async () => {
  throw new Error("Social login not supported on custom backend");
};
export const sendPasswordResetEmail = async () => {
  throw new Error("Password reset not implemented yet");
};
export const GoogleAuthProvider = class { constructor() {} };
export const FacebookAuthProvider = class { constructor() {} };
export type User = any;
