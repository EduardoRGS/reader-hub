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
                new ParameterizedTypeReference<ApiResponse<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody().getData());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar manga: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<MangaDto> searchMangas(String query, Integer limit, Integer offset) {
        // TODO: Implementar chamada à API externa
        return List.of();
    }

    @Override
    public PaginatedDto<MangaDto> getMangas(Integer limit, Integer offset) {
        var url  = UriComponentsBuilder.fromUriString(apiUrl + "/manga").
                queryParam("limit", limit).
                queryParam("offset", offset).build().toUriString();
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new  ParameterizedTypeReference<PaginatedDto<MangaDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar mangas: " + e.getMessage());
        }
        return new PaginatedDto<>(List.of(), 0, offset, limit);
    }

    @Override
    public Optional<AuthorDto> getAuthorById(String id) {
        var url = apiUrl + "/author/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<AuthorDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody() .getData());
            }
        } catch (Exception e) {
            System.err.println("Erro ao buscar autor: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public PaginatedDto<AuthorDto> getAuthors(Integer limit, Integer offset) {
        var url = UriComponentsBuilder.fromUriString(apiUrl + "/author")
                .queryParam("limit", limit)
                .queryParam("offset", offset).build().toUriString();
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<PaginatedDto<AuthorDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return new PaginatedDto<>(response.getBody().getData(),
                        response.getBody().getTotal(),
                        response.getBody().getOffset(),
                        response.getBody().getLimit());
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar aotores: " + e.getMessage());
        }
        return new PaginatedDto<>(List.of(), 0, offset, limit);
    }

    @Override
    public Optional<ChapterDto> getChapterById(String id) {
        var url =  apiUrl + "/chapter/" + id;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ApiResponse<ChapterDto>>() {});
            if (response.getBody() != null && response.getBody().getData() != null) {
                return Optional.of(response.getBody() .getData());
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar chapter: " + e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<ChapterDto> getChaptersByMangaId(String mangaId, Integer limit, Integer offset) {
        // TODO: Implementar chamada à API externa
        return List.of();
    }

    @Override
    public List<String> getChapterPages(String chapterId) {
        var url =  apiUrl + "/at-home/server/" + chapterId;
        try {
            var response = restTemplate.exchange(url, GET, null,
                    new ParameterizedTypeReference<ChapterDto>() {});
            if (response.getBody() != null && response.getBody().getChapter() != null) {
                return new ArrayList<>(response.getBody().getChapter().getData());
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar pages do capitulo: " + e.getMessage());
        }
        return null;
    }
} 