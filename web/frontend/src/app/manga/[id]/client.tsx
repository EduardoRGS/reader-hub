'use client';

import React from 'react';
import Image from 'next/image';
import { useMangaDetails } from '@/hooks/useMangaDetails';
import { useRouter } from 'next/navigation';
import { useReaderStoreHydrated } from '@/hooks/useHydration';
import { MangaDescription } from '@/components/MangaDescription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Eye, Heart, Star, BookOpen, CheckCircle } from 'lucide-react';

export default function MangaPageClient({ id }: { id: string }) {
  const { manga, chapters, loading, error } = useMangaDetails(id);
  const router = useRouter();
  const { readingHistory } = useReaderStoreHydrated();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Carregando...</div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Erro ao carregar o mangá</div>
      </div>
    );
  }

  const getChapterReadStatus = (chapterId: string) => {
    return readingHistory.some(item => item.chapterId === chapterId);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ongoing': return 'default';
      case 'completed': return 'secondary';
      case 'hiatus': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Em andamento';
      case 'completed': return 'Concluído';
      case 'hiatus': return 'Em pausa';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com botão de voltar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image
                  src={manga.coverImage || manga.image || '/placeholder-manga.jpg'}
                  alt={manga.title['pt-br'] || manga.title['en']}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Card>
          </div>

          {/* Manga Info */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={getStatusVariant(manga.status)}>
                  {getStatusText(manga.status)}
                </Badge>
                {manga.year && (
                  <Badge variant="outline">{manga.year}</Badge>
                )}
                {manga.genres && Array.isArray(manga.genres) && manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">{typeof genre === 'string' ? genre : JSON.stringify(genre)}</Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold mb-4 text-foreground">
                {manga.title['pt-br'] || manga.title['en']}
              </h1>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {manga.rating && (
                  <Card className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{manga.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </Card>
                )}
                {manga.views && (
                  <Card className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{manga.views.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Visualizações</p>
                  </Card>
                )}
                {manga.follows && (
                  <Card className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-semibold">{manga.follows.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Seguidores</p>
                  </Card>
                )}
                {chapters.length > 0 && (
                  <Card className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-semibold">{chapters.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Capítulos</p>
                  </Card>
                )}
              </div>

              {manga.author && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <BookOpen className="w-4 h-4" />
                  <span>Por {typeof manga.author === 'string' ? manga.author : JSON.stringify(manga.author)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description and Chapters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Synopsis */}
            {manga.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sinopse</CardTitle>
                </CardHeader>
                <CardContent>
                  <MangaDescription 
                    description={manga.description['pt-br'] || manga.description['en']} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Chapters */}
            <Card>
              <CardHeader>
                <CardTitle>Capítulos ({chapters.length})</CardTitle>
                <CardDescription>
                  Lista de todos os capítulos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters
                    .sort((a, b) => b.number - a.number)
                    .map((chapter) => {
                      const isRead = getChapterReadStatus(chapter.id);
                      return (
                        <Card
                          key={chapter.id}
                          className={`cursor-pointer transition-colors hover:bg-accent ${
                            isRead ? 'bg-muted' : ''
                          }`}
                          onClick={() => router.push(`/manga/${id}/chapter/${chapter.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">
                                  Capítulo {chapter.number}
                                </span>
                                {chapter.title && (
                                  <span className="text-muted-foreground">- {chapter.title}</span>
                                )}
                                {isRead && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Lido
                                  </Badge>
                                )}
                              </div>
                              {chapter.releaseDate && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(chapter.releaseDate).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {manga.status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(manga.status)}>
                      {getStatusText(manga.status)}
                    </Badge>
                  </div>
                )}
                
                {manga.year && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ano de Publicação</p>
                    <p className="text-sm">{manga.year}</p>
                  </div>
                )}

                {manga.author && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Autor</p>
                    <p className="text-sm">{typeof manga.author === 'string' ? manga.author : manga.author.name}</p>
                  </div>
                )}

                {manga.genres && manga.genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Gêneros</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(manga.genres) && manga.genres.map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {typeof genre === 'string' ? genre : JSON.stringify(genre)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {manga.rating && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{manga.rating.toFixed(1)}/10</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}