import { CategoryCardProps } from '@/types/manga';

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white hover:shadow-lg hover:shadow-current/25 transition-all duration-300 transform hover:scale-105`}>
        <h4 className="font-bold text-lg mb-2">{category.name}</h4>
        <p className="text-white/80 text-sm">{category.count} mangás</p>
      </div>
    </div>
  );
} 