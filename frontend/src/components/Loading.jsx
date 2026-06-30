import { Loader2 } from 'lucide-react';

export const Spinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 w-full h-[250px] animate-pulse flex flex-col justify-between">
      <div className="bg-gray-300 h-32 w-full rounded-md mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};
