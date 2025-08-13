package com.reader_hub.application.ports;

import com.reader_hub.application.dto.*;
import com.reader_hub.application.dto.ExternalMangaDto;

import java.util.List;
import java.util.Optional;

public interface ApiService {
    // Busca de mangas
    Optional<ExternalMangaDto> getMangaById(String id);
    List<ExternalMangaDto> searchMangas(String query, Integer limit, Integer offset);
    PaginatedDto<ExternalMangaDto> getMangas(Integer limit, Integer offset);
    
    // Busca de autores
    Optional<AuthorDto> getAuthorById(String id);
    PaginatedDto<AuthorDto> getAuthors(Integer limit, Integer offset);

    // Busca de capítulos
    Optional<ChapterDto> getChapterById(String id);
    List<ChapterDto> getChaptersByMangaId(String mangaId, Integer limit, Integer offset);
    List<String> getChapterPages(String chapterId);
    
    // Busca de capas
    String getMangaCoverUrl(String mangaId);
    
    // Métodos adicionais para busca especializada
    PaginatedDto<ExternalMangaDto> getPopularMangas(Integer limit, Integer offset);
    PaginatedDto<ExternalMangaDto> getRecentMangas(Integer limit, Integer offset);
}