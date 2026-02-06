package com.reader_hub.application.adapter;

import com.reader_hub.application.dto.*;
import com.reader_hub.application.dto.ExternalMangaDto;
import com.reader_hub.application.exception.ExternalApiException;
import com.reader_hub.application.ports.ApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpMethod.GET;

@Service
@Slf4j
public class ApiServiceImpl implements ApiService {

    @Value("${mangadex.api.url:https://api.mangadex.org}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public ApiServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Optional<ExternalMangaDto> getMangaById(String id) {
        String url = apiUrl + "/manga/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                new ParameterizedTypeReference<ApiSingleResponse<ExternalMangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody().getData());
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar manga com ID {}: {}", id, e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao buscar manga: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar manga com ID {}: {}", id, e.getMessage(), e);
        }
        return Optional.empty();
    }

    @Override
    public List<ExternalMangaDto> searchMangas(String query, Integer limit, Integer offset) {
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
                    new ParameterizedTypeReference<ApiResponse<ExternalMangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar mangas com query '{}': {}", query, e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao buscar mangas: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar mangas com query '{}': {}", query, e.getMessage(), e);
        }
        return List.of();
    }

    @Override
    public PaginatedDto<ExternalMangaDto> getMangas(Integer limit, Integer offset) {
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
                    new ParameterizedTypeReference<ApiResponse<ExternalMangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (RestClientException e) {
            log.error("Erro ao listar mangas: {}", e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao listar mangas: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao listar mangas: {}", e.getMessage(), e);
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
        } catch (RestClientException e) {
            log.error("Erro ao buscar autor com ID {}: {}", id, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar autor com ID {}: {}", id, e.getMessage(), e);
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
        } catch (RestClientException e) {
            log.error("Erro ao listar autores: {}", e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao listar autores: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao listar autores: {}", e.getMessage(), e);
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
        } catch (RestClientException e) {
            log.error("Erro ao buscar capítulo com ID {}: {}", id, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar capítulo com ID {}: {}", id, e.getMessage(), e);
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
        } catch (RestClientException e) {
            log.error("Erro ao buscar capítulos do manga {}: {}", mangaId, e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao buscar capítulos: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar capítulos do manga {}: {}", mangaId, e.getMessage(), e);
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
                
                List<String> imageUrls = new ArrayList<>();
                for (String fileName : chapterData.getData()) {
                    imageUrls.add(baseUrl + "/data/" + hash + "/" + fileName);
                }
                return imageUrls;
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar páginas do capítulo {}: {}", chapterId, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar páginas do capítulo {}: {}", chapterId, e.getMessage(), e);
        }
        return List.of();
    }
    
    @Override
    public PaginatedDto<ExternalMangaDto> getPopularMangas(Integer limit, Integer offset) {
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
                    new ParameterizedTypeReference<ApiResponse<ExternalMangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar mangas populares: {}", e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao buscar mangas populares: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar mangas populares: {}", e.getMessage(), e);
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }
    
    @Override
    public PaginatedDto<ExternalMangaDto> getRecentMangas(Integer limit, Integer offset) {
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
                    new ParameterizedTypeReference<ApiResponse<ExternalMangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar mangas recentes: {}", e.getMessage());
            throw new ExternalApiException("MangaDex", "Falha ao buscar mangas recentes: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar mangas recentes: {}", e.getMessage(), e);
        }
        return new PaginatedDto<>(List.of(), 0, offset != null ? offset : 0, limit != null ? limit : 20);
    }

    @Override
    public String getMangaCoverUrl(String mangaId) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/manga/" + mangaId)
                .queryParam("includes[]", "cover_art")
                .build().toUriString();
        
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiSingleResponse<ExternalMangaDto>>() {});
            
            if (response.getBody() != null && 
                response.getBody().getData() != null) {
                
                ExternalMangaDto manga = response.getBody().getData();
                if (manga.getRelationships() != null) {
                    for (ExternalMangaDto.SimpleRelationship relationship : manga.getRelationships()) {
                        if ("cover_art".equals(relationship.getType()) && relationship.getAttributes() != null) {
                            String fileName = (String) relationship.getAttributes().get("fileName");
                            if (fileName != null) {
                                return "https://uploads.mangadex.org/covers/" + mangaId + "/" + fileName;
                            }
                        }
                    }
                }
            }
        } catch (RestClientException e) {
            log.error("Erro ao buscar capa do manga {}: {}", mangaId, e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar capa do manga {}: {}", mangaId, e.getMessage(), e);
        }
        return null;
    }
}
