interface LibraryStatsProps {
  stats: {
    total: number;
    completed: number;
    ongoing: number;
    hiatus: number;
    cancelled: number;
    pages: number;
  };
}

export default function LibraryStats({ stats }: LibraryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.total}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mangás Encontrados
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.completed}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Completos
        </div>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {stats.ongoing}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Em Andamento
        </div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {stats.pages}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Páginas
        </div>
      </div>
    </div>
  );
} 