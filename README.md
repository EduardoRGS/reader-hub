# Reader Hub

> **English** | [Portugues](#portugues)

---

## English

Full-stack platform for reading and managing mangas. Fetches data from the MangaDex API, stores it locally, and provides a built-in reader with bilingual support.

### Tech Stack

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Backend  | Spring Boot 3.5.3, Java 17, PostgreSQL 15, Redis 7             |
| Frontend | Next.js 15.4.1 (App Router), React 19, TypeScript              |
| UI       | Radix UI Themes, Tailwind CSS, Lucide React                    |
| State    | Zustand (client), TanStack Query v5 (server), TanStack Virtual |
| Infra    | Docker Compose (PostgreSQL, Redis, PgAdmin), Gradle, npm       |

### Features

- **Library** with pagination, status filters, and full-text search
- **Reader** with page and webtoon modes, keyboard shortcuts, saved progress
- **Slider** on the home page, configurable from the admin panel
- **Live search** in the header with results dropdown
- **Admin panel** to import mangas/chapters from MangaDex, manage the slider, and view stats
- **i18n** full support (PT-BR and EN) - titles, descriptions, chapters, and the entire UI
- **Theme** light/dark toggle
- **Cache** with Redis
- **Documented API** with Swagger/OpenAPI

### Getting Started

#### Prerequisites

- Java 17+
- Node.js 18+
- Docker and Docker Compose

#### 1. Infrastructure (PostgreSQL + Redis)

```bash
cd server/backend
cp .env.example .env   # edit credentials if needed
docker-compose up -d
```

#### 2. Backend

```bash
cd server/backend
./gradlew bootRun
```

Available at `http://localhost:8080`

#### 3. Frontend

```bash
cd web/frontend
npm install
npm run dev
```

Available at `http://localhost:3000`

### Scripts

```bash
# Backend
./gradlew bootRun       # dev server
./gradlew build         # build
./gradlew test          # tests

# Frontend
npm run dev             # dev server (Turbopack)
npm run build           # production build
npm run start           # production server
npm run lint            # lint
```

### Project Structure

```
reader-hub/
├── server/backend/              # Spring Boot REST API
│   ├── src/main/java/.../
│   │   ├── application/         # controllers, DTOs, config
│   │   └── domain/              # models, repositories, services
│   ├── docker-compose.yml       # PostgreSQL, Redis, PgAdmin
│   └── build.gradle
└── web/frontend/                # Next.js App
    └── src/
        ├── app/                 # pages (home, library, admin, manga, reader)
        ├── components/          # React components
        ├── hooks/               # custom hooks + React Query
        ├── lib/                 # utils, i18n
        ├── services/            # API client (Axios)
        └── store/               # Zustand (preferences, slider)
```

### Main Endpoints

| Method | Route                           | Description             |
| ------ | ------------------------------- | ----------------------- |
| GET    | `/api/manga`                    | List mangas (paginated) |
| GET    | `/api/manga/search?q=`          | Search mangas by title  |
| GET    | `/api/manga/local/{id}`         | Manga details           |
| GET    | `/api/chapter/local/manga/{id}` | Chapters for a manga    |
| POST   | `/api/populate/popular-mangas`  | Import popular mangas   |
| POST   | `/api/populate/chapters/{id}`   | Import chapters         |
| GET    | `/swagger-ui.html`              | Full API documentation  |

### Environment Variables

```env
POSTGRES_USER=readerhub
POSTGRES_PASSWORD=readerhub123
DB_NAME=readerhub
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

<a id="portugues"></a>

## Portugues

Plataforma full-stack para leitura e gerenciamento de mangas. Consome dados da API do MangaDex, armazena localmente e oferece um leitor integrado com suporte a dois idiomas.

### Tech Stack

| Camada   | Tecnologia                                                     |
| -------- | -------------------------------------------------------------- |
| Backend  | Spring Boot 3.5.3, Java 17, PostgreSQL 15, Redis 7             |
| Frontend | Next.js 15.4.1 (App Router), React 19, TypeScript              |
| UI       | Radix UI Themes, Tailwind CSS, Lucide React                    |
| Estado   | Zustand (client), TanStack Query v5 (server), TanStack Virtual |
| Infra    | Docker Compose (PostgreSQL, Redis, PgAdmin), Gradle, npm       |

### Funcionalidades

- **Biblioteca** com paginacao, filtros por status e busca full-text
- **Leitor** com modo pagina e webtoon, atalhos de teclado, progresso salvo
- **Slider** na home page, configuravel pelo painel admin
- **Live search** no header com dropdown de resultados
- **Painel admin** para importar mangas/capitulos do MangaDex, gerenciar slider e ver estatisticas
- **i18n** completo (PT-BR e EN) - titulos, descricoes, capitulos e toda a UI
- **Tema** claro/escuro
- **Cache** com Redis
- **API documentada** com Swagger/OpenAPI

### Como Rodar

#### Pre-requisitos

- Java 17+
- Node.js 18+
- Docker e Docker Compose

#### 1. Infraestrutura (PostgreSQL + Redis)

```bash
cd server/backend
cp .env.example .env   # edite as credenciais se necessario
docker-compose up -d
```

#### 2. Backend

```bash
cd server/backend
./gradlew bootRun
```

Disponivel em `http://localhost:8080`

#### 3. Frontend

```bash
cd web/frontend
npm install
npm run dev
```

Disponivel em `http://localhost:3000`

### Scripts

```bash
# Backend
./gradlew bootRun       # servidor dev
./gradlew build         # build
./gradlew test          # testes

# Frontend
npm run dev             # servidor dev (Turbopack)
npm run build           # build producao
npm run start           # servidor producao
npm run lint            # lint
```

### Estrutura

```
reader-hub/
├── server/backend/              # API REST Spring Boot
│   ├── src/main/java/.../
│   │   ├── application/         # controllers, DTOs, config
│   │   └── domain/              # models, repositories, services
│   ├── docker-compose.yml       # PostgreSQL, Redis, PgAdmin
│   └── build.gradle
└── web/frontend/                # Next.js App
    └── src/
        ├── app/                 # paginas (home, library, admin, manga, reader)
        ├── components/          # componentes React
        ├── hooks/               # hooks customizados + React Query
        ├── lib/                 # utils, i18n
        ├── services/            # cliente API (Axios)
        └── store/               # Zustand (preferencias, slider)
```

### Endpoints Principais

| Metodo | Rota                            | Descricao                    |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/api/manga`                    | Listar mangas (paginado)     |
| GET    | `/api/manga/search?q=`          | Buscar mangas por titulo     |
| GET    | `/api/manga/local/{id}`         | Detalhe do manga             |
| GET    | `/api/chapter/local/manga/{id}` | Capitulos de um manga        |
| POST   | `/api/populate/popular-mangas`  | Importar mangas populares    |
| POST   | `/api/populate/chapters/{id}`   | Importar capitulos           |
| GET    | `/swagger-ui.html`              | Documentacao completa da API |

### Variaveis de Ambiente

```env
POSTGRES_USER=readerhub
POSTGRES_PASSWORD=readerhub123
DB_NAME=readerhub
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

MIT License | Data provided by [MangaDex API](https://api.mangadex.org)
