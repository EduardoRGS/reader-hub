export type Locale = "pt-br" | "en";

/**
 * Mapeia locale do app para códigos de idioma que o MangaDex usa nos capítulos.
 * Ex.: "pt-br" aceita capítulos com language "pt-br" ou "pt".
 */
export const CHAPTER_LANGUAGE_MAP: Record<Locale, string[]> = {
  "pt-br": ["pt-br", "pt"],
  en: ["en"],
};

const translations: Record<Locale, Record<string, string>> = {
  // ═══════════════════════════════════════════════════════
  //  PORTUGUÊS (BR)
  // ═══════════════════════════════════════════════════════
  "pt-br": {
    // ─── Geral ──────────────────────────────────────────
    "app.name": "Reader Hub",
    "app.tagline":
      "Seu acervo de mangás online. Descubra, leia e acompanhe suas séries favoritas.",
    "general.loading": "Carregando...",
    "general.error": "Ocorreu um erro.",
    "general.retry": "Tentar novamente",
    "general.close": "Fechar",
    "general.no_cover": "Sem capa",

    // ─── Navegação ──────────────────────────────────────
    "nav.home": "Início",
    "nav.library": "Biblioteca",
    "nav.admin": "Admin",

    // ─── Tema ───────────────────────────────────────────
    "theme.light": "Tema claro",
    "theme.dark": "Tema escuro",

    // ─── Idioma ─────────────────────────────────────────
    "language.label": "Idioma",
    "language.pt-br": "Português",
    "language.en": "English",

    // ─── Footer ─────────────────────────────────────────
    "footer.disclaimer":
      "Reader Hub © {year} — Projeto de estudo. Dados fornecidos pela API do MangaDex.",

    // ─── Hero ───────────────────────────────────────────
    "hero.explore": "Explorar Biblioteca",
    "hero.admin": "Painel Admin",

    // ─── Home: Seções ───────────────────────────────────
    "featured.title": "Destaques",
    "featured.subtitle": "Mangás com melhor avaliação",
    "featured.error": "Erro ao carregar destaques.",
    "popular.title": "Populares",
    "popular.subtitle": "Mangás mais visualizados",
    "popular.error": "Erro ao carregar populares.",

    // ─── Status do Mangá ────────────────────────────────
    "status.ongoing": "Em andamento",
    "status.completed": "Completo",
    "status.hiatus": "Hiato",
    "status.cancelled": "Cancelado",

    // ─── Biblioteca ─────────────────────────────────────
    "library.title": "Biblioteca",
    "library.search": "Buscar mangás...",
    "library.all_status": "Todos os status",
    "library.results": "{count} mangá(s) encontrado(s)",
    "library.empty": "Nenhum mangá encontrado.",
    "library.empty_hint":
      "Tente ajustar os filtros ou popule o banco via o painel Admin.",
    "library.load_more": "Carregar mais",

    // ─── Detalhe do Mangá ───────────────────────────────
    "manga.back": "Voltar à Biblioteca",
    "manga.not_found": "Mangá não encontrado.",
    "manga.rating": "Avaliação",
    "manga.votes": "{count} votos",
    "manga.views": "Visualizações",
    "manga.follows": "Seguidores",
    "manga.year": "Ano",
    "manga.chapters": "Capítulos",
    "manga.continue": "Continuar Cap. {number}",
    "manga.start_reading": "Começar a Ler",
    "manga.import_chapters": "Importar Capítulos",
    "manga.update_chapters": "Atualizar Capítulos",
    "manga.importing": "Importando...",
    "manga.tab_chapters": "Capítulos",
    "manga.tab_about": "Sobre",
    "manga.no_description": "Nenhuma descrição disponível.",
    "manga.about_author": "Sobre o Autor",
    "manga.no_biography": "Sem biografia disponível.",
    "manga.no_title": "Sem título",

    // ─── Lista de Capítulos ─────────────────────────────
    "chapters.empty": "Nenhum capítulo disponível.",
    "chapters.import_mangadex": "Importar Capítulos do MangaDex",
    "chapters.importing": "Importando capítulos...",
    "chapters.search": "Buscar capítulo...",
    "chapters.count": "{count} capítulo(s)",
    "chapters.col_number": "Cap.",
    "chapters.col_title": "Título",
    "chapters.col_date": "Data",
    "chapters.last_read": "Último",
    "chapters.chapter_n": "Capítulo {number}",
    "chapters.no_language":
      "Nenhum capítulo em {language}. Mostrando todos os idiomas disponíveis.",
    "chapters.language_pt": "português",
    "chapters.language_en": "inglês",

    // ─── Leitor ─────────────────────────────────────────
    "reader.settings": "Configurações do Leitor",
    "reader.settings_desc": "Personalize sua experiência de leitura.",
    "reader.mode": "Modo de Leitura",
    "reader.mode_page": "Página",
    "reader.mode_webtoon": "Webtoon",
    "reader.auto_next": "Próximo capítulo automático",
    "reader.auto_next_desc": "Avançar ao fim das páginas",
    "reader.show_page_number": "Exibir número da página",
    "reader.show_page_number_desc": "Mostrar progresso na navegação",
    "reader.shortcuts": "Atalhos de Teclado",
    "reader.shortcut_page": "Página anterior / próxima",
    "reader.shortcut_chapter": "Capítulo anterior / próximo",
    "reader.shortcut_home_end": "Primeira / última página",
    "reader.shortcut_back": "Voltar ao mangá",
    "reader.no_pages": "Nenhuma página disponível.",
    "reader.image_error": "Erro ao carregar imagem",
    "reader.prev": "Anterior",
    "reader.next": "Próximo",
    "reader.go_to": "Ir para...",
    "reader.loading": "Carregando capítulo...",
    "reader.not_found": "Capítulo não encontrado.",
    "reader.back_to_manga": "Voltar ao Mangá",

    // ─── Admin ──────────────────────────────────────────
    "admin.title": "Painel Admin",
    "admin.stats_title": "Estatísticas do Banco",
    "admin.stats_mangas": "Mangás",
    "admin.stats_authors": "Autores",
    "admin.stats_chapters": "Capítulos",
    "admin.stats_error": "Erro ao carregar estatísticas.",
    "admin.health_title": "Status do Servidor",
    "admin.health_down":
      "Servidor indisponível. Verifique se o backend está rodando.",
    "admin.health_up": "Servidor funcionando",
    "admin.actions_title": "Ações de População",
    "admin.popular_title": "Mangás Populares",
    "admin.popular_desc":
      "Importar mangás populares do MangaDex para o banco local.",
    "admin.popular_btn": "Importar Populares",
    "admin.recent_title": "Mangás Recentes",
    "admin.recent_desc":
      "Importar mangás atualizados recentemente do MangaDex.",
    "admin.recent_btn": "Importar Recentes",
    "admin.complete_title": "População Completa",
    "admin.complete_desc":
      "Importar mangás populares com todos os seus capítulos.",
    "admin.complete_btn": "Importar Completo",
    "admin.covers_title": "Atualizar Capas",
    "admin.covers_desc":
      "Atualizar imagens de capa de todos os mangás salvos.",
    "admin.covers_btn": "Atualizar Capas",
    "admin.processing": "Processando...",
    "admin.search_title": "Buscar e Importar",
    "admin.search_desc":
      "Digite o nome do mangá e os resultados aparecem automaticamente.",
    "admin.search_placeholder": "Nome do mangá (min. 2 caracteres)...",
    "admin.search_btn": "Buscar",
    "admin.searching": "Buscando...",
    "admin.search_empty": "Nenhum resultado para \"{query}\".",
    "admin.search_hint": "Comece a digitar para buscar mangás no MangaDex...",
    "admin.search_results": "{count} resultado(s) encontrado(s)",
    "admin.search_save": "Importar",
    "admin.search_saving": "Salvando...",
    "admin.search_saved": "Importado!",
    "admin.search_save_error": "Erro ao importar",
    "admin.search_chapters": "{count} cap.",
    "admin.search_no_chapters": "? cap.",
    "admin.search_original": "Original",
    "admin.search_languages": "Idiomas",
  },

  // ═══════════════════════════════════════════════════════
  //  ENGLISH
  // ═══════════════════════════════════════════════════════
  en: {
    // ─── General ────────────────────────────────────────
    "app.name": "Reader Hub",
    "app.tagline":
      "Your online manga library. Discover, read, and follow your favorite series.",
    "general.loading": "Loading...",
    "general.error": "An error occurred.",
    "general.retry": "Try again",
    "general.close": "Close",
    "general.no_cover": "No cover",

    // ─── Navigation ─────────────────────────────────────
    "nav.home": "Home",
    "nav.library": "Library",
    "nav.admin": "Admin",

    // ─── Theme ──────────────────────────────────────────
    "theme.light": "Light theme",
    "theme.dark": "Dark theme",

    // ─── Language ───────────────────────────────────────
    "language.label": "Language",
    "language.pt-br": "Português",
    "language.en": "English",

    // ─── Footer ─────────────────────────────────────────
    "footer.disclaimer":
      "Reader Hub © {year} — Study project. Data provided by the MangaDex API.",

    // ─── Hero ───────────────────────────────────────────
    "hero.explore": "Explore Library",
    "hero.admin": "Admin Panel",

    // ─── Home: Sections ─────────────────────────────────
    "featured.title": "Featured",
    "featured.subtitle": "Top rated mangas",
    "featured.error": "Failed to load featured mangas.",
    "popular.title": "Popular",
    "popular.subtitle": "Most viewed mangas",
    "popular.error": "Failed to load popular mangas.",

    // ─── Manga Status ───────────────────────────────────
    "status.ongoing": "Ongoing",
    "status.completed": "Completed",
    "status.hiatus": "Hiatus",
    "status.cancelled": "Cancelled",

    // ─── Library ────────────────────────────────────────
    "library.title": "Library",
    "library.search": "Search mangas...",
    "library.all_status": "All statuses",
    "library.results": "{count} manga(s) found",
    "library.empty": "No mangas found.",
    "library.empty_hint":
      "Try adjusting the filters or populate the database from the Admin panel.",
    "library.load_more": "Load more",

    // ─── Manga Detail ───────────────────────────────────
    "manga.back": "Back to Library",
    "manga.not_found": "Manga not found.",
    "manga.rating": "Rating",
    "manga.votes": "{count} votes",
    "manga.views": "Views",
    "manga.follows": "Followers",
    "manga.year": "Year",
    "manga.chapters": "Chapters",
    "manga.continue": "Continue Ch. {number}",
    "manga.start_reading": "Start Reading",
    "manga.import_chapters": "Import Chapters",
    "manga.update_chapters": "Update Chapters",
    "manga.importing": "Importing...",
    "manga.tab_chapters": "Chapters",
    "manga.tab_about": "About",
    "manga.no_description": "No description available.",
    "manga.about_author": "About the Author",
    "manga.no_biography": "No biography available.",
    "manga.no_title": "No title",

    // ─── Chapter List ───────────────────────────────────
    "chapters.empty": "No chapters available.",
    "chapters.import_mangadex": "Import Chapters from MangaDex",
    "chapters.importing": "Importing chapters...",
    "chapters.search": "Search chapter...",
    "chapters.count": "{count} chapter(s)",
    "chapters.col_number": "Ch.",
    "chapters.col_title": "Title",
    "chapters.col_date": "Date",
    "chapters.last_read": "Last",
    "chapters.chapter_n": "Chapter {number}",
    "chapters.no_language":
      "No chapters in {language}. Showing all available languages.",
    "chapters.language_pt": "Portuguese",
    "chapters.language_en": "English",

    // ─── Reader ─────────────────────────────────────────
    "reader.settings": "Reader Settings",
    "reader.settings_desc": "Customize your reading experience.",
    "reader.mode": "Reading Mode",
    "reader.mode_page": "Page",
    "reader.mode_webtoon": "Webtoon",
    "reader.auto_next": "Auto next chapter",
    "reader.auto_next_desc": "Advance when reaching last page",
    "reader.show_page_number": "Show page number",
    "reader.show_page_number_desc": "Display progress in navigation",
    "reader.shortcuts": "Keyboard Shortcuts",
    "reader.shortcut_page": "Previous / next page",
    "reader.shortcut_chapter": "Previous / next chapter",
    "reader.shortcut_home_end": "First / last page",
    "reader.shortcut_back": "Back to manga",
    "reader.no_pages": "No pages available.",
    "reader.image_error": "Failed to load image",
    "reader.prev": "Previous",
    "reader.next": "Next",
    "reader.go_to": "Go to...",
    "reader.loading": "Loading chapter...",
    "reader.not_found": "Chapter not found.",
    "reader.back_to_manga": "Back to Manga",

    // ─── Admin ──────────────────────────────────────────
    "admin.title": "Admin Panel",
    "admin.stats_title": "Database Statistics",
    "admin.stats_mangas": "Mangas",
    "admin.stats_authors": "Authors",
    "admin.stats_chapters": "Chapters",
    "admin.stats_error": "Failed to load statistics.",
    "admin.health_title": "Server Status",
    "admin.health_down": "Server unavailable. Check if the backend is running.",
    "admin.health_up": "Server running",
    "admin.actions_title": "Population Actions",
    "admin.popular_title": "Popular Mangas",
    "admin.popular_desc":
      "Import popular mangas from MangaDex to the local database.",
    "admin.popular_btn": "Import Popular",
    "admin.recent_title": "Recent Mangas",
    "admin.recent_desc":
      "Import recently updated mangas from MangaDex.",
    "admin.recent_btn": "Import Recent",
    "admin.complete_title": "Complete Population",
    "admin.complete_desc":
      "Import popular mangas with all their chapters.",
    "admin.complete_btn": "Import Complete",
    "admin.covers_title": "Update Covers",
    "admin.covers_desc":
      "Update cover images for all saved mangas.",
    "admin.covers_btn": "Update Covers",
    "admin.processing": "Processing...",
    "admin.search_title": "Search & Import",
    "admin.search_desc":
      "Type a manga name and results will appear automatically.",
    "admin.search_placeholder": "Manga name (min. 2 characters)...",
    "admin.search_btn": "Search",
    "admin.searching": "Searching...",
    "admin.search_empty": "No results for \"{query}\".",
    "admin.search_hint": "Start typing to search mangas on MangaDex...",
    "admin.search_results": "{count} result(s) found",
    "admin.search_save": "Import",
    "admin.search_saving": "Saving...",
    "admin.search_saved": "Imported!",
    "admin.search_save_error": "Import failed",
    "admin.search_chapters": "{count} ch.",
    "admin.search_no_chapters": "? ch.",
    "admin.search_original": "Original",
    "admin.search_languages": "Languages",
  },
};

/**
 * Traduz uma chave para o idioma atual, com suporte a variáveis.
 * Ex.: t("pt-br", "manga.votes", { count: 150 }) → "150 votos"
 */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const str = translations[locale]?.[key] ?? translations["en"]?.[key] ?? key;
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
    str
  );
}
