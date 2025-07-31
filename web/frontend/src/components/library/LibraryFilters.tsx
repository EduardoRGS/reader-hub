interface LibraryFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function LibraryFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onSearchSubmit,
}: LibraryFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Busca */}
      <form onSubmit={onSearchSubmit} className="md:col-span-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar mangás por título..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Filtro por Status */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Todos os Status</option>
        <option value="ongoing">Em Andamento</option>
        <option value="completed">Completo</option>
        <option value="hiatus">Em Hiato</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>
  );
} 