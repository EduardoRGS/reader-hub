import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar mangás por título..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="default">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Filtro por Status */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ongoing">Em Andamento</SelectItem>
            <SelectItem value="completed">Completo</SelectItem>
            <SelectItem value="hiatus">Em Hiato</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}