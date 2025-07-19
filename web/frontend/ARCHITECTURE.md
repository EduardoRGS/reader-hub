# Arquitetura do Reader Hub Frontend

## 📁 Estrutura de Pastas

```
src/
├── app/                    # App Router do Next.js 15
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Home page
│   ├── globals.css        # Estilos globais
│   └── favicon.ico        # Ícone do site
├── components/            # Componentes reutilizáveis
│   ├── Header.tsx         # Cabeçalho da aplicação
│   ├── HeroSection.tsx    # Seção hero da home
│   ├── MangaCard.tsx      # Card de mangá (featured/popular)
│   ├── CategoryCard.tsx   # Card de categoria
│   ├── Footer.tsx         # Rodapé da aplicação
│   └── index.ts           # Barrel exports
├── data/                  # Dados mockados
│   └── mockData.ts        # Dados temporários para desenvolvimento
├── hooks/                 # Custom hooks
│   └── useMangaData.ts    # Hook para gerenciar dados de manga
├── types/                 # Definições TypeScript
│   └── manga.ts           # Interfaces e tipos relacionados a manga
└── utils/                 # Utilitários (futuro)
```

## 🏗️ Padrões de Arquitetura

### 1. **Componentes Modulares**
- Cada componente tem responsabilidade única
- Props tipadas com TypeScript
- Reutilização através de variants (`MangaCard`)

### 2. **Separação de Responsabilidades**
- **`/components`**: UI components puros
- **`/data`**: Dados mockados (será API integration)
- **`/hooks`**: Lógica de estado personalizada
- **`/types`**: Contratos e interfaces TypeScript

### 3. **TypeScript First**
- Tipagem forte em todos os componentes
- Interfaces centralizadas em `/types`
- Props e estado completamente tipados

### 4. **Barrel Exports**
- Importações simplificadas via `index.ts`
- Melhor developer experience
- Facilita refatoração futura

## 🎨 Design System

### Cores
- **Primary**: Blue (600) to Purple (600) gradient
- **Secondary**: Various category gradients
- **Background**: Dynamic (light/dark mode)
- **Text**: Foreground color system

### Componentes
- **MangaCard**: Duas variantes (featured/popular)
- **CategoryCard**: Cards com gradientes únicos
- **Header**: Sticky navigation com busca
- **Footer**: Links organizados em grid

## 🔮 Preparação para o Futuro

### API Integration
- Hook `useMangaData` preparado para calls reais
- Loading states implementados
- Estrutura de dados flexível

### Escalabilidade
- Componentes atômicos e compostos
- Sistema de tipos robusto
- Padrões consistentes de código

### Performance
- Next.js 15 com App Router
- Componentes otimizados para tree-shaking
- Lazy loading preparado

## 🛠️ Tecnologias

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Utility-first CSS
- **React 19**: Últimas features do React

## 📝 Próximos Passos

1. **Integração com Backend**: Conectar com API Java Spring Boot
2. **Autenticação**: Implementar sistema de login/registro
3. **Páginas Internas**: Criar páginas de mangá, capítulos, perfil
4. **Estado Global**: Implementar Context API ou Zustand
5. **Testing**: Adicionar Jest + Testing Library
6. **Performance**: Otimizações e analytics 