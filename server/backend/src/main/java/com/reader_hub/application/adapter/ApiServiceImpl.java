package com.reader_hub.application.adapter;

import com.reader_hub.application.dto.*;
import com.reader_hub.application.ports.ApiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpMethod.GET;

@Service
public class ApiServiceImpl implements ApiService {
    @Value("${mangadex.api.url:https://api.mangadex.org}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public ApiServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Optional<MangaDto> getMangaById(String id) {
        String url = apiUrl + "/manga/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                new ParameterizedTypeReference<ApiSingleResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody().getData());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar manga: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public List<MangaDto> searchMangas(String query, Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga")
                .queryParam("title", query)
                .queryParam("limit", limit != null ? limit : 20)
                .queryParam("offset", offset != null ? offset : 0)
                .queryParam("includes[]", "author")
                .queryParam("includes[]", "artist")
                .queryParam("includes[]", "cover_art")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar mangas: " + e.getMessage());
            e.printStackTrace();
        }
        return List.of();
    }

    @Override
    public PaginatedDto<MangaDto> getMangas(Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga")
                .queryParam("limit", limit != null ? limit : 20)
                .queryParam("offset", offset != null ? offset : 0)
                .queryParam("includes[]", "author")
                .queryParam("includes[]", "artist")
                .queryParam("includes[]", "cover_art")
                .queryParam("order[latestUploadedChapter]", "desc")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar mangas: " + e.getMessage());
            e.printStackTrace();
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }

    @Override
    public Optional<AuthorDto> getAuthorById(String id) {
        var url = apiUrl + "/author/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiSingleResponse<AuthorDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody().getData());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar autor: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public PaginatedDto<AuthorDto> getAuthors(Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/author")
                .queryParam("limit", limit != null ? limit : 20)
                .queryParam("offset", offset != null ? offset : 0)
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<AuthorDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar autores: " + e.getMessage());
            e.printStackTrace();
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }

    @Override
    public Optional<ChapterDto> getChapterById(String id) {
        var url = apiUrl + "/chapter/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiSingleResponse<ChapterDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody().getData());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar capítulo: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public List<ChapterDto> getChaptersByMangaId(String mangaId, Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga/" + mangaId + "/feed")
                .queryParam("limit", limit != null ? limit : 500)
                .queryParam("offset", offset != null ? offset : 0)
                .queryParam("order[chapter]", "asc")
                .queryParam("translatedLanguage[]", "pt-br")
                .queryParam("translatedLanguage[]", "en")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<ChapterDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar capítulos do manga: " + e.getMessage());
            e.printStackTrace();
        }
        return List.of();
    }

    @Override
    public List<String> getChapterPages(String chapterId) {
        var url = apiUrl + "/at-home/server/" + chapterId;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ChapterDto.ChapterPagesDto>() {});
            if (response.getBody() != null && response.getBody().getChapter() != null) {
                var chapterData = response.getBody().getChapter();
                var baseUrl = response.getBody().getBaseUrl();
                var hash = chapterData.getHash();
                
                // Construir URLs completas das imagens
                List<String> imageUrls = new ArrayList<>();
                for (String fileName : chapterData.getData()) {
                    imageUrls.add(baseUrl + "/data/" + hash + "/" + fileName);
                }
                return imageUrls;
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar páginas do capítulo: " + e.getMessage());
            e.printStackTrace();
        }
        return List.of();
    }
    
    /**
     * Busca mangas populares (por seguidores)
     */
    public PaginatedDto<MangaDto> getPopularMangas(Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga")
                .queryParam("limit", limit != null ? limit : 20)
                .queryParam("offset", offset != null ? offset : 0)
                .queryParam("includes[]", "author")
                .queryParam("includes[]", "artist") 
                .queryParam("includes[]", "cover_art")
                .queryParam("order[followedCount]", "desc")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar mangas populares: " + e.getMessage());
            e.printStackTrace();
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }
    
    /**
     * Busca mangas recentes
     */
    public PaginatedDto<MangaDto> getRecentMangas(Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga")
                .queryParam("limit", limit != null ? limit : 20)
                .queryParam("offset", offset != null ? offset : 0)
                .queryParam("includes[]", "author")
                .queryParam("includes[]", "artist")
                .queryParam("includes[]", "cover_art")
                .queryParam("order[createdAt]", "desc")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar mangas recentes: " + e.getMessage());
            e.printStackTrace();
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }

    /**
     * Busca a URL da capa de um manga
     */
    @Override
    public String getMangaCoverUrl(String mangaId) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga/" + mangaId)
                .queryParam("includes[]", "cover_art")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiSingleResponse<MangaDto>>() {});
            
            if (response.getBody() != null && 
                response.getBody().getData() != null) {
                
                MangaDto manga = response.getBody().getData();
                if (manga.getRelationships() != null) {
                    // Procurar por relacionamento do tipo cover_art
                    for (MangaDto.SimpleRelationship relationship : manga.getRelationships()) {
                        if ("cover_art".equals(relationship.getType()) && relationship.getAttributes() != null) {
                            String fileName = relationship.getAttributes().get("fileName");
                            if (fileName != null) {
                                // URL correta da imagem da capa
                                return "https://uploads.mangadex.org/covers/" + mangaId + "/" + fileName;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar capa do manga: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
} 