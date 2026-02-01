'use client';

import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
      {/* Image Area Skeleton */}
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
      </div>

      {/* Content Area Skeleton */}
      <div className="p-3 flex flex-col flex-grow space-y-3">
        {/* Category & Title */}
        <div className="space-y-2">
           <div className="h-3 bg-gray-200 rounded w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
           </div>
           <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
           </div>
        </div>
        
        {/* Price & Button */}
        <div className="mt-auto flex items-end justify-between pt-2">
           <div className="h-5 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
           </div>
           <div className="w-8 h-8 bg-gray-200 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
