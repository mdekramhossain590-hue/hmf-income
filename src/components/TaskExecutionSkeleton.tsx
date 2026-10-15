import React from "react";
import { ArrowLeft, ExternalLink, Image, CheckCircle, ShieldCheck, FileText, Send } from "lucide-react";

interface SkeletonProps {
  className?: string;
}

export function SkeletonPulse({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#1A1A1A] rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent ${className}`}
    />
  );
}

export function TaskExecutionSkeleton() {
  return (
    <div className="pt-6 px-4 pb-24 max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Top Navigation Bar Skeleton */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3215] flex items-center justify-center text-[#737373]">
            <ArrowLeft className="w-5 h-5 opacity-40" />
          </div>
          <div>
            <SkeletonPulse className="h-6 w-36 mb-1.5" />
            <SkeletonPulse className="h-3.5 w-24 opacity-60" />
          </div>
        </div>
        <SkeletonPulse className="h-7 w-20 rounded-full" />
      </div>

      {/* Main Task Execution Card */}
      <div className="bg-[#151515] rounded-3xl shadow-xl border border-[#3D3215] overflow-hidden mb-6">
        {/* Cover Image / Hero Banner Skeleton */}
        <div className="relative w-full h-44 sm:h-52 bg-[#121212] overflow-hidden border-b border-[#3D3215] flex items-center justify-center">
          <SkeletonPulse className="absolute inset-0 rounded-none !bg-[#141414]" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-[#3D3215]">
            <Image className="w-10 h-10 opacity-30 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase opacity-40">
              Loading Task Media...
            </span>
          </div>

          {/* Top Left Badge Skeleton */}
          <div className="absolute top-3 left-3 z-20">
            <div className="h-6 w-24 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center px-2.5">
              <SkeletonPulse className="h-3 w-16" />
            </div>
          </div>

          {/* Top Right Reward Badge Skeleton */}
          <div className="absolute top-3 right-3 z-20">
            <div className="h-7 w-24 rounded-full bg-gradient-to-r from-[#D4A017]/30 to-[#FACC15]/40 border border-[#FACC15]/30 flex items-center justify-center px-3 shadow-lg">
              <SkeletonPulse className="h-3.5 w-16 !bg-[#FACC15]/30" />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Title & Subtitle */}
          <div className="mb-5">
            <SkeletonPulse className="h-6 w-3/4 mb-2.5 rounded-md" />
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-4 w-28 rounded-md" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#3D3215]" />
              <SkeletonPulse className="h-4 w-20 rounded-md" />
            </div>
          </div>

          {/* Task Instructions / Description Card Skeleton */}
          <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] mb-5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-3.5 h-3.5 text-[#D4A017]/50" />
              <SkeletonPulse className="h-3.5 w-44" />
            </div>
            <div className="space-y-2">
              <SkeletonPulse className="h-3.5 w-full" />
              <SkeletonPulse className="h-3.5 w-[92%]" />
              <SkeletonPulse className="h-3.5 w-[75%]" />
            </div>
          </div>

          {/* Action Link Button Skeleton */}
          <div className="w-full h-12 rounded-xl bg-[#1A1A1A] border border-[#3D3215] flex items-center justify-center gap-2 mb-5">
            <SkeletonPulse className="h-4 w-32" />
            <ExternalLink className="w-4 h-4 text-[#737373] opacity-50" />
          </div>

          {/* Metrics / Info Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#101010] rounded-xl p-3 border border-[#3D3215]">
                <SkeletonPulse className="h-3 w-16 mb-2 opacity-60" />
                <SkeletonPulse className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proof Requirements Checklist Skeleton */}
      <div className="bg-[#151515] rounded-2xl border border-[#3D3215] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#D4A017]/60" />
          <SkeletonPulse className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-[#101010] p-3 rounded-xl border border-[#3D3215]/60">
            <div className="w-5 h-5 rounded-full bg-[#1C1C1C] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#737373]/40" />
            </div>
            <div className="w-full space-y-1.5">
              <SkeletonPulse className="h-3.5 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2 opacity-60" />
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#101010] p-3 rounded-xl border border-[#3D3215]/60">
            <div className="w-5 h-5 rounded-full bg-[#1C1C1C] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#737373]/40" />
            </div>
            <div className="w-full space-y-1.5">
              <SkeletonPulse className="h-3.5 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Proof Submission Form Skeleton */}
      <div className="bg-[#151515] rounded-2xl border border-[#3D3215] p-5 space-y-4">
        <div>
          <SkeletonPulse className="h-4 w-36 mb-2" />
          <div className="w-full h-24 rounded-xl bg-[#101010] border border-[#3D3215] p-3">
            <SkeletonPulse className="h-3.5 w-48 opacity-50" />
          </div>
        </div>

        <div>
          <SkeletonPulse className="h-4 w-32 mb-2" />
          <div className="w-full h-32 rounded-xl bg-[#101010] border-2 border-dashed border-[#3D3215] flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <Image className="w-5 h-5 text-[#737373]/50" />
            </div>
            <SkeletonPulse className="h-3.5 w-40" />
            <SkeletonPulse className="h-2.5 w-24 opacity-60" />
          </div>
        </div>

        <div className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8A6508]/30 via-[#D4A017]/30 to-[#FACC15]/30 border border-[#3D3215] flex items-center justify-center gap-2">
          <SkeletonPulse className="h-4 w-28 !bg-[#FACC15]/20" />
          <Send className="w-4 h-4 text-[#737373]/40" />
        </div>
      </div>
    </div>
  );
}

export default TaskExecutionSkeleton;
