# 📚 Reader Hub

Uma plataforma moderna e completa para leitura e gerenciamento de mangás, desenvolvida com tecnologias de ponta para proporcionar a melhor experiência de leitura digital.

## 🌟 Características

- **Interface Moderna**: UI responsiva e elegante construída com Next.js 15 e Shadcn UI
- **Leitura Otimizada**: Múltiplos modos de leitura (padrão e webtoon) com navegação intuitiva
- **Gerenciamento Completo**: Sistema completo de biblioteca pessoal com filtros e estatísticas
- **Performance**: Carregamento rápido com React Query e otimizações do Next.js
- **Responsivo**: Experiência consistente em desktop, tablet e mobile
- **Temas**: Suporte a modo claro e escuro

## 🏗️ Arquitetura

O projeto segue uma arquitetura full-stack moderna:

```
reader-hub/
├── server/backend/     # API REST com Spring Boot
└── web/frontend/       # Interface web com Next.js
```

### 🔧 Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.3
- **Linguagem**: Java 17
- **Banco de Dados**: PostgreSQL (produção) / H2 (desenvolvimento)
- **Documentação**: OpenAPI/Swagger
- **Validação**: Spring Validation
- **ORM**: Spring Data JPA

### 🎨 Frontend (Next.js)
- **Framework**: Next.js 15.4.1 com App Router
- **Linguagem**: TypeScript
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **Estado**: Zustand + React Query
- **Ícones**: Lucide React
- **Animações**: Tailwind CSS Animate

## 🚀 Começando

### Pré-requisitos

- **Java 17+** (para o backend)
- **Node.js 18+** (para o frontend)
- **PostgreSQL** (para produção)

### 🔧 Configuração do Backend

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd reader-hub/server/backend
   ```

2. **Configure o banco de dados**:
   - Crie um banco PostgreSQL
   - Configure as variáveis de ambiente no arquivo `.env`

3. **Execute o backend**:
   ```bash
   ./gradlew bootRun
   ```

   O backend estará disponível em `http://localhost:8080`

### 🎨 Configuração do Frontend

1. **Navegue para o frontend**:
   ```bash
   cd web/frontend
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

   O frontend estará disponível em `http://localhost:3000`

## 📱 Funcionalidades

### 📖 Leitura
- **Múltiplos Modos**: Leitura padrão (página por página) e modo webtoon (scroll contínuo)
- **Navegação Intuitiva**: Controles de teclado e mouse para navegação rápida
- **Zoom e Pan**: Controles de zoom para melhor visualização
- **Marcadores**: Sistema de marcação de progresso de leitura

### 📚 Biblioteca
- **Organização**: Sistema completo de categorização e filtros
- **Estatísticas**: Acompanhamento de progresso e estatísticas de leitura
- **Busca Avançada**: Filtros por status, gênero, autor, etc.
- **Paginação**: Navegação eficiente através de grandes coleções

### 🎨 Interface
- **Design Responsivo**: Adaptação automática para diferentes tamanhos de tela
- **Temas**: Modo claro e escuro com transições suaves
- **Componentes Modernos**: UI consistente com componentes Shadcn UI
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

## 🛠️ Scripts Disponíveis

### Backend
```bash
./gradlew bootRun          # Executa o servidor de desenvolvimento
./gradlew build            # Constrói o projeto
./gradlew test             # Executa os testes
```

### Frontend
```bash
npm run dev                # Servidor de desenvolvimento
npm run build              # Build de produção
npm run start              # Servidor de produção
npm run lint               # Verificação de código
```

## 🐳 Docker

O projeto inclui configuração Docker para facilitar o deployment:

```bash
cd server/backend
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
reader-hub/
├── LICENSE                 # Licença do projeto
├── README.md              # Este arquivo
├── server/
│   └── backend/           # API Spring Boot
│       ├── src/           # Código fonte Java
│       ├── build.gradle   # Configuração Gradle
│       └── docker-compose.yml
└── web/
    └── frontend/          # Aplicação Next.js
        ├── src/           # Código fonte TypeScript/React
        ├── public/        # Arquivos estáticos
        ├── package.json   # Dependências Node.js
        └── tailwind.config.js
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🔗 Links Úteis

- **Documentação da API**: `http://localhost:8080/swagger-ui.html`
- **Frontend**: `http://localhost:3000`
- **Spring Boot**: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
- **Next.js**: [https://nextjs.org](https://nextjs.org)
- **Shadcn UI**: [https://ui.shadcn.com](https://ui.shadcn.com)

---

Desenvolvido com ❤️ para a comunidade de leitores de mangá