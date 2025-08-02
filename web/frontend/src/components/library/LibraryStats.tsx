import { BookOpen, CheckCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const statsData = [
    {
      icon: BookOpen,
      value: stats.total,
      label: 'Mangás Encontrados',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: CheckCircle,
      value: stats.completed,
      label: 'Completos',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Clock,
      value: stats.ongoing,
      label: 'Em Andamento',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: FileText,
      value: stats.pages,
      label: 'Páginas',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className={`${stat.bgColor} border-0`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}