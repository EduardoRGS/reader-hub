'use client';



interface MangaCardSkeletonProps {
  variant?: 'featured' | 'popular' | 'default';
}

export function MangaCardSkeleton({ variant = 'default' }: MangaCardSkeletonProps) {
  const height = variant === 'featured' ? 'h-80' : 'h-64';
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse ${height}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
  );
}

export function MangaDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Skeleton da capa */}
            <div className="lg:col-span-1">
              <div className="w-full max-w-sm mx-auto h-96 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            </div>

            {/* Skeleton das informações */}
            <div className="lg:col-span-2">
              <div className="flex gap-3 mb-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16 animate-pulse"></div>
              </div>
              
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4 animate-pulse"></div>
              
              <div className="flex gap-6 mb-6">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}