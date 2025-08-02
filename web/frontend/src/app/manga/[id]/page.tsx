// Componente do servidor
import React from 'react';
import MangaPageClient from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Função para gerar metadados - necessária para acessar params em Next.js 14
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Manga ${id}`,
  };
}

export default async function MangaPage({ params }: PageProps) {
  // Acessando o id dos params com await
  const { id } = await params;
  
  // Componente do lado do cliente para usar hooks
  return <MangaPageClient id={id} />
}