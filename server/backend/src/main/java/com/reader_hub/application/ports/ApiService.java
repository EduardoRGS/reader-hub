package com.reader_hub.application.ports;

import com.reader_hub.application.dto.*;

import java.util.List;
import java.util.Optional;

public interface ApiService {
    // Busca de mangas
    Optional<MangaDto> getMangaById(String id);
    List<MangaDto> searchMangas(String query, Integer limit, Integer offset);
    PaginatedDto<MangaDto> getMangas(Integer limit, Integer offset);
    
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
    PaginatedDto<MangaDto> getPopularMangas(Integer limit, Integer offset);
    PaginatedDto<MangaDto> getRecentMangas(Integer limit, Integer offset);
}