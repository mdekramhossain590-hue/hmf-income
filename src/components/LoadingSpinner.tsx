import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-10 h-10 text-[#0D47A1] animate-spin" />
      <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] dark:bg-slate-900">
      <LoadingSpinner />
    </div>
  );
}
