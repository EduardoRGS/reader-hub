package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Language;
import com.reader_hub.domain.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthorService {
    
    private final AuthorRepository authorRepository;
    
    /**
     * Salva um novo autor no banco de dados
     */
    public Author saveAuthor(Author author) {
        log.info("Salvando autor: {}", author.getName());
        
        // Verificar se já existe por apiId antes de salvar
        if (author.getApiId() != null) {
            Optional<Author> existing = authorRepository.findByApiId(author.getApiId());
            if (existing.isPresent()) {
                log.info("Autor já existe com apiId: {}", author.getApiId());
                return existing.get();
            }
        }
        
        return authorRepository.save(author);
    }
    
    /**
     * Cria um novo autor
     */
    public Author createAuthor(AuthorDto authorDto) {
        log.info("Criando novo autor - Nome: {}", authorDto.getAttributes().getName());
        
        // Verificar se autor já existe por apiId para evitar duplicatas
        Optional<Author> existingAuthor = authorRepository.findByApiId(authorDto.getId());
        if (existingAuthor.isPresent()) {
            log.info("Autor já existe com apiId: {}", authorDto.getId());
            return existingAuthor.get();
        }
        
        var author = new Author();
        author.setApiId(authorDto.getId());
        author.setName(authorDto.getAttributes().getName());
        
        // Converter corretamente Map<String, String> para Language
        if (authorDto.getAttributes().getBiography() != null) {
            Language biography = new Language();
            Map<String, String> bioMap = authorDto.getAttributes().getBiography();
            biography.setEn(bioMap.get("en"));
            biography.setPt_BR(bioMap.get("pt-br"));
            author.setBiography(biography);
        }
        
        return saveAuthor(author);
    }
    
    /**
     * Atualiza um autor existente
     */
    public Author updateAuthor(Author author) {
        log.info("Atualizando autor: {}", author.getId());
        
        if (!authorRepository.existsById(author.getId())) {
            throw new IllegalArgumentException("Autor não encontrado com ID: " + author.getId());
        }
        
        return authorRepository.save(author);
    }
    
    /**
     * Busca autor por ID
     */
    @Transactional(readOnly = true)
    public Optional<Author> findById(String id) {
        return authorRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Author> findByApiId(String apiId) {
        return authorRepository.findByApiId(apiId);
    }

    /**
     * Busca autor por ID com os mangás relacionados
     */
    @Transactional(readOnly = true)
    public Optional<Author> findByIdWithMangas(String id) {
        return authorRepository.findByIdWithMangas(id);
    }
    
    /**
     * Busca autor por nome
     */
    @Transactional(readOnly = true)
    public Optional<Author> findByName(String name) {
        return authorRepository.findByName(name);
    }
    
    /**
     * Busca autores por nome (busca parcial)
     */
    @Transactional(readOnly = true)
    public List<Author> findByNameContaining(String name) {
        return authorRepository.findByNameContainingIgnoreCase(name);
    }
    
    /**
     * Lista todos os autores
     */
    @Transactional(readOnly = true)
    public List<Author> findAll() {
        return authorRepository.findAll();
    }
    
    /**
     * Deleta um autor por ID
     */
    public void deleteAuthor(String id) {
        log.info("Deletando autor: {}", id);
        
        if (!authorRepository.existsById(id)) {
            throw new IllegalArgumentException("Autor não encontrado com ID: " + id);
        }
        
        authorRepository.deleteById(id);
    }
    
    /**
     * Verifica se um autor existe por ID
     */
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return authorRepository.existsById(id);
    }
    
    /**
     * Verifica se um autor existe por nome
     */
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return authorRepository.existsByName(name);
    }

    /**
     * Conta total de autores - OTIMIZADO para estatísticas
     */
    @Transactional(readOnly = true)
    public long countAll() {
        return authorRepository.count();
    }
} 