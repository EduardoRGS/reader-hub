package com.reader_hub.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthorDto {
    private String id;
    private String type;
    private ApiAuthorAttributes attributes;
    private List<SimpleRelationship> relationships;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SimpleRelationship {
        private String id;
        private String type;
    }
    
    @Data
@JsonIgnoreProperties(ignoreUnknown = true)
public static class ApiAuthorAttributes {
        private String name;
        private String imageUrl;
        private Map<String, String> biography;
        private String twitter;
        private String pixiv;
        private String melonBook;
        private String fanBox;
        private String booth;
        private String nicoVideo;
        private String skeb;
        private String fantia;
        private String tumblr;
        private String youtube;
        private String weibo;
        private String naver;
        private String website;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private Integer version;
    }
}