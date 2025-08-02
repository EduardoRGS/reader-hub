'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  // Classes base para todos os tipos de skeleton
  let baseClasses = 'bg-gray-200 dark:bg-gray-700 ';
  
  // Adicionar classes de animação
  if (animation === 'pulse') {
    baseClasses += 'animate-pulse ';
  } else if (animation === 'wave') {
    baseClasses += 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[wave_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent ';
  }
  
  // Adicionar classes específicas para cada variante
  if (variant === 'circular') {
    baseClasses += 'rounded-full ';
  } else if (variant === 'text') {
    baseClasses += 'rounded-md ';
    // Altura padrão para texto se não for especificada
    height = height || '1rem';
  } else {
    // Rectangular
    baseClasses += 'rounded-md ';
  }
  
  // Estilo inline para width e height
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }
  
  return <div className={`${baseClasses} ${className}`} style={style} />;
}