package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Relationship;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
public class AuthorDto {
    private String id;
    private String type;
    private ApiAuthorAttributes attributes;
    private List<Relationship> relationships;
    
    @Data
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