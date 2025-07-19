package com.reader_hub.domain.service;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        
        if (authorRepository.existsByName(author.getName())) {
            throw new IllegalArgumentException("Já existe um autor com este nome: " + author.getName());
        }
        
        return authorRepository.save(author);
    }
    
    /**
     * Cria um novo autor
     */
    public Author createAuthor(String id, String name) {
        log.info("Criando novo autor - ID: {}, Nome: {}", id, name);
        
        Author author = new Author();
        author.setId(id);
        author.setName(name);
        
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
} 