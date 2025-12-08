import React from 'react';
import Skeleton from '../ui/Skeleton';

const ExamCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <div className="flex items-start justify-between mb-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-16 w-16 ml-4" />
      </div>
      <div className="min-h-[170px]">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="mt-auto pt-6">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
};

export default ExamCardSkeleton;
