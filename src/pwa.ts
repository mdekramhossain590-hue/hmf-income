// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

export let deferredPrompt: any = null;
type PromptCallback = (prompt: any) => void;
const listeners: PromptCallback[] = [];

export const onPwaPrompt = (callback: PromptCallback) => {
  listeners.push(callback);
  if (deferredPrompt) callback(deferredPrompt);
  
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const clearPwaPrompt = () => {
  deferredPrompt = null;
  listeners.forEach(cb => cb(null));
};

if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    listeners.forEach(cb => cb(e));
  });
}
