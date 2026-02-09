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
    "nav.search_placeholder": "Buscar mangás...",
    "nav.search_all": "Ver todos os resultados para \"{query}\"",
    "nav.search_no_results": "Nenhum resultado encontrado.",

    // ─── Slider ──────────────────────────────────────────
    "slider.read_now": "Ler Agora",
    "slider.prev": "Slide anterior",
    "slider.next": "Próximo slide",

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
    "footer.made_with": "Feito com",

    // ─── Hero ───────────────────────────────────────────
    "hero.explore": "Explorar Biblioteca",
    "hero.admin": "Painel Admin",
    "hero.feature_catalog": "Catálogo Completo",
    "hero.feature_reader": "Leitor Integrado",

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
    "library.page_info": "Página {current} de {total}",

    // ─── Pagination ────────────────────────────────────────
    "pagination.first": "Primeira página",
    "pagination.prev": "Página anterior",
    "pagination.next": "Próxima página",
    "pagination.last": "Última página",

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
    "reader.shortcut_mode": "Alternar modo de leitura",
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
    "admin.progress_complete": "Operação concluída com sucesso!",
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

    // ─── Slider Manager ─────────────────────────────────
    "admin.slider_title": "Slider da Home",
    "admin.slider_desc":
      "Selecione os mangás que vão aparecer no slider da página inicial.",
    "admin.slider_current": "Mangás no slider",
    "admin.slider_empty":
      "Nenhum mangá no slider. Busque e adicione abaixo.",
    "admin.slider_add": "Adicionar mangá ao slider",
    "admin.slider_search_placeholder": "Buscar mangá para adicionar...",
    "admin.slider_position": "Posição {pos}",
    "admin.slider_added": "Adicionado",

    // ─── Gerenciamento de Mangás ───────────────────────────
    "admin.manage_title": "Gerenciar Mangás",
    "admin.manage_desc":
      "Selecione os mangás que deseja remover. A exclusão também remove todos os capítulos associados.",
    "admin.manage_search_placeholder": "Filtrar mangás...",
    "admin.manage_delete": "Excluir",
    "admin.manage_deleting": "Excluindo...",
    "admin.manage_deleted": "{count} mangá(s) excluído(s) com sucesso!",
    "admin.manage_delete_error": "Erro ao excluir mangá(s).",
    "admin.manage_confirm_title": "Confirmar Exclusão",
    "admin.manage_confirm_desc":
      "Tem certeza que deseja excluir {count} mangá(s)? Todos os capítulos associados também serão removidos. Esta ação não pode ser desfeita.",
    "admin.manage_confirm_yes": "Sim, excluir {count}",
    "admin.manage_confirm_no": "Cancelar",
    "admin.manage_chapters_count": "{count} cap.",
    "admin.manage_select_all": "Selecionar todos",
    "admin.manage_deselect_all": "Limpar seleção",
    "admin.manage_selected": "{count} selecionado(s)",
    "admin.manage_delete_selected": "Excluir selecionados",
    "admin.manage_load_more": "Carregar mais",
    "admin.manage_total": "{count} mangá(s) no banco",
    "admin.manage_empty": "Nenhum mangá cadastrado.",
    "admin.manage_loading": "Carregando mangás...",

    // ─── Autenticação ────────────────────────────────────
    "auth.login": "Entrar",
    "auth.register": "Criar Conta",
    "auth.logout": "Sair",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.name": "Nome",
    "auth.email_placeholder": "seu@email.com",
    "auth.password_placeholder": "Sua senha",
    "auth.name_placeholder": "Seu nome",
    "auth.login_title": "Bem-vindo de volta",
    "auth.login_subtitle": "Entre na sua conta para continuar",
    "auth.register_title": "Criar nova conta",
    "auth.register_subtitle": "Junte-se ao Reader Hub",
    "auth.no_account": "Não tem uma conta?",
    "auth.has_account": "Já tem uma conta?",
    "auth.login_error": "Email ou senha inválidos.",
    "auth.register_error": "Erro ao criar conta. Tente novamente.",
    "auth.email_in_use": "Este email já está em uso.",
    "auth.password_min": "A senha deve ter no mínimo 8 caracteres.",
    "auth.password_length": "A senha deve ter entre 8 e 32 caracteres.",
    "auth.confirm_password": "Confirmar Senha",
    "auth.confirm_password_placeholder": "Digite a senha novamente",
    "auth.password_mismatch": "As senhas não coincidem.",
    "auth.name_min": "O nome deve ter no mínimo 2 caracteres.",
    "auth.welcome": "Olá, {name}",
    "auth.admin_badge": "Admin",
    "auth.session_expired": "Sessão expirada. Faça login novamente.",
    "auth.access_denied": "Acesso Negado",
    "auth.access_denied_desc": "Você precisa ser administrador para acessar esta página.",
    "auth.login_required": "Login Necessário",
    "auth.login_required_desc": "Faça login na sua conta para acessar esta página.",
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
    "nav.search_placeholder": "Search mangas...",
    "nav.search_all": "See all results for \"{query}\"",
    "nav.search_no_results": "No results found.",

    // ─── Slider ──────────────────────────────────────────
    "slider.read_now": "Read Now",
    "slider.prev": "Previous slide",
    "slider.next": "Next slide",

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
    "footer.made_with": "Made with",

    // ─── Hero ───────────────────────────────────────────
    "hero.explore": "Explore Library",
    "hero.admin": "Admin Panel",
    "hero.feature_catalog": "Full Catalog",
    "hero.feature_reader": "Built-in Reader",

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
    "library.page_info": "Page {current} of {total}",

    // ─── Pagination ────────────────────────────────────────
    "pagination.first": "First page",
    "pagination.prev": "Previous page",
    "pagination.next": "Next page",
    "pagination.last": "Last page",

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
    "reader.shortcut_mode": "Toggle reading mode",
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
    "admin.progress_complete": "Operation completed successfully!",
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

    // ─── Slider Manager ─────────────────────────────────
    "admin.slider_title": "Home Slider",
    "admin.slider_desc":
      "Select the mangas that will appear on the home page slider.",
    "admin.slider_current": "Mangas in slider",
    "admin.slider_empty":
      "No mangas in slider. Search and add below.",
    "admin.slider_add": "Add manga to slider",
    "admin.slider_search_placeholder": "Search manga to add...",
    "admin.slider_position": "Position {pos}",
    "admin.slider_added": "Added",

    // ─── Manga Management ──────────────────────────────────
    "admin.manage_title": "Manage Mangas",
    "admin.manage_desc":
      "Select the mangas you want to remove. Deleting also removes all associated chapters.",
    "admin.manage_search_placeholder": "Filter mangas...",
    "admin.manage_delete": "Delete",
    "admin.manage_deleting": "Deleting...",
    "admin.manage_deleted": "{count} manga(s) deleted successfully!",
    "admin.manage_delete_error": "Failed to delete manga(s).",
    "admin.manage_confirm_title": "Confirm Deletion",
    "admin.manage_confirm_desc":
      "Are you sure you want to delete {count} manga(s)? All associated chapters will also be removed. This action cannot be undone.",
    "admin.manage_confirm_yes": "Yes, delete {count}",
    "admin.manage_confirm_no": "Cancel",
    "admin.manage_chapters_count": "{count} ch.",
    "admin.manage_select_all": "Select all",
    "admin.manage_deselect_all": "Clear selection",
    "admin.manage_selected": "{count} selected",
    "admin.manage_delete_selected": "Delete selected",
    "admin.manage_load_more": "Load more",
    "admin.manage_total": "{count} manga(s) in database",
    "admin.manage_empty": "No mangas registered.",
    "admin.manage_loading": "Loading mangas...",

    // ─── Authentication ──────────────────────────────────
    "auth.login": "Sign In",
    "auth.register": "Sign Up",
    "auth.logout": "Sign Out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.email_placeholder": "your@email.com",
    "auth.password_placeholder": "Your password",
    "auth.name_placeholder": "Your name",
    "auth.login_title": "Welcome back",
    "auth.login_subtitle": "Sign in to your account to continue",
    "auth.register_title": "Create new account",
    "auth.register_subtitle": "Join Reader Hub",
    "auth.no_account": "Don't have an account?",
    "auth.has_account": "Already have an account?",
    "auth.login_error": "Invalid email or password.",
    "auth.register_error": "Error creating account. Try again.",
    "auth.email_in_use": "This email is already in use.",
    "auth.password_min": "Password must be at least 8 characters.",
    "auth.password_length": "Password must be between 8 and 32 characters.",
    "auth.confirm_password": "Confirm Password",
    "auth.confirm_password_placeholder": "Type your password again",
    "auth.password_mismatch": "Passwords do not match.",
    "auth.name_min": "Name must be at least 2 characters.",
    "auth.welcome": "Hi, {name}",
    "auth.admin_badge": "Admin",
    "auth.session_expired": "Session expired. Please log in again.",
    "auth.access_denied": "Access Denied",
    "auth.access_denied_desc": "You need to be an administrator to access this page.",
    "auth.login_required": "Login Required",
    "auth.login_required_desc": "Please sign in to your account to access this page.",
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
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    str
  );
}
