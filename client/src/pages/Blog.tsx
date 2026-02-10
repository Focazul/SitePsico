import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { trpc } from '@/lib/trpc';
import { BookOpen, Calendar, Clock, Filter, Search, Tag as TagIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAGE_SIZE = 6;

export default function Blog() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const listRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const sidebarRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  const [search, setSearch] = useState('');
  // For simplicity, we are handling client-side filtering for category/tag for now,
  // or we could implement server-side filtering.
  // The API supports search query, limit, offset.
  // But category/tag filtering logic in current API is limited (only categoryId).
  // I'll fetch posts via searchPosts and filter on client if needed, or stick to search.
  // Actually, let's keep it simple: use searchPosts for text search.
  // For Category/Tag filtering, we might need to extend API or do client side.
  // Given the MVP nature, let's do client side filtering on the fetched page or better:
  // Since pagination is involved, client-side filtering on a page is weird.
  // Let's rely on 'searchPosts' which searches title/content.
  // For exact category filtering, we'll implement it if API allows.
  // API `getPosts` allows `categoryId`. `searchPosts` does not.

  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null); // Tag filtering not directly supported by API yet
  const [page, setPage] = useState(1);

  // Fetch categories and tags
  const { data: categoriesData } = trpc.blog.getCategories.useQuery();
  const { data: tagsData } = trpc.blog.getTags.useQuery();

  // Determine which query to use
  // If we have a category selected, we should find its ID.
  const selectedCategoryId = useMemo(() => {
    if (!category || !categoriesData) return undefined;
    const cat = categoriesData.find(c => c.name === category);
    return cat?.id;
  }, [category, categoriesData]);

  const selectedTagId = useMemo(() => {
    if (!tag || !tagsData) return undefined;
    const t = tagsData.find(t => t.name === tag);
    return t?.id;
  }, [tag, tagsData]);

  // Main query
  // Note: API `searchPosts` takes query string. `getPosts` takes categoryId.
  // If we have search term, we use searchPosts.
  // If we have category, we use getPosts.
  // If both? Search takes precedence or we need a new API endpoint.
  // Let's prioritize search if present.

  const isSearch = search.length > 0;

  const searchPostsQuery = trpc.blog.searchPosts.useQuery(
    {
      query: search,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    },
    { enabled: isSearch }
  );

  const getPostsQuery = trpc.blog.getPosts.useQuery(
    {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      categoryId: selectedCategoryId,
      tagId: selectedTagId
    },
    { enabled: !isSearch }
  );

  const postsData = isSearch ? searchPostsQuery.data : getPostsQuery.data;
  const isLoading = isSearch ? searchPostsQuery.isLoading : getPostsQuery.isLoading;

  const posts = postsData?.posts || [];
  const totalCount = postsData?.count || 0;

  const filteredPosts = posts;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const resetFilters = () => {
    setCategory(null);
    setTag(null);
    setPage(1);
    setSearch('');
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "dd MMM yyyy", { locale: ptBR });
  };

  // Mock read time based on content length
  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO */}
        <section className="py-16 md:py-24 section-light">
          <div className="container">
            <div
              ref={heroRef.ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-all duration-700 ${
                heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="space-y-4">
                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">Blog e Conteúdo</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Conteúdo educativo sobre saúde mental
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Artigos para orientar escolhas informadas, reduzir estigmas e apoiar sua jornada de autocuidado.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-border/60">Psicoterapia</Badge>
                  <Badge variant="outline" className="border-border/60">Autoconhecimento</Badge>
                  <Badge variant="outline" className="border-border/60">Saúde emocional</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="btn-lapis-lazuli"
                    onClick={() => (window.location.href = '/#agendamento')}
                  >
                    Agendar uma conversa
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-outline-blue"
                    onClick={() => (window.location.href = '/#sobre')}
                  >
                    Conhecer a terapia
                  </Button>
                </div>
              </div>

              <Card className="p-6 border-accent/20 shadow-lg bg-card/95 backdrop-blur">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <p className="font-semibold text-foreground">Curadoria responsável</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conteúdo pensado para informar sem substituir avaliação individual. Para diagnósticos e condutas, busque sempre
                  orientação profissional personalizada.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    Atualizações frequentes
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    Linguagem clara e ética
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* LISTING + SIDEBAR */}
        <section className="py-16 md:py-24 section-soft">
          <div className="container grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
            <div
              ref={listRef.ref}
              className={`space-y-6 transition-all duration-700 ${
                listRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <p className="text-sm">Filtre por categoria ou tema</p>
                </div>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
                <div className="flex items-center gap-3 bg-card/95 border border-accent/20 rounded-xl px-4 py-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar por título, tema ou palavra-chave"
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Categorias:</span>
                  <Button
                    size="sm"
                    variant={category ? 'outline' : 'default'}
                    className={!category ? 'btn-filter-selected' : 'border-accent text-accent hover:bg-accent/10'}
                    onClick={() => {
                      setCategory(null);
                      setPage(1);
                    }}
                  >
                    Todas
                  </Button>
                  {categoriesData?.map((c) => (
                    <Button
                      key={c.id}
                      size="sm"
                      variant={category === c.name ? 'default' : 'outline'}
                      className={category === c.name ? 'btn-filter-selected' : 'border-accent text-accent hover:bg-accent/10'}
                      onClick={() => {
                        setCategory(c.name);
                        setPage(1);
                      }}
                    >
                      {c.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <TagIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                <Badge
                  variant={tag ? 'outline' : 'default'}
                  className={!tag ? 'btn-filter-selected' : 'border-accent text-accent hover:bg-accent/10 cursor-pointer'}
                  onClick={() => {
                    setTag(null);
                    setPage(1);
                  }}
                >
                  Todas
                </Badge>
                {tagsData?.map((t) => (
                  <Badge
                    key={t.id}
                    variant={tag === t.name ? 'default' : 'outline'}
                    className={tag === t.name ? 'btn-filter-selected cursor-pointer' : 'border-accent text-accent hover:bg-accent/10 cursor-pointer'}
                    onClick={() => {
                      setTag(t.name);
                      setPage(1);
                    }}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
                  <Button variant="link" onClick={resetFilters}>Limpar filtros</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block group h-full">
                      <Card className="h-full overflow-hidden border-border/60 hover:border-accent hover:shadow-md transition-all duration-200">
                        <div className="aspect-[16/9] bg-muted overflow-hidden">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              width="800"
                              height="450"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-accent/50" />
                            </div>
                          )}
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {post.category && (
                              <Badge className="text-[11px] px-2 py-1">
                                {post.category.name}
                              </Badge>
                            )}
                            {post.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.publishedAt)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {getReadTime(post.content)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                             {post.excerpt || post.content.substring(0, 150) + '...'}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.map((t) => (
                              <Badge key={t.id} variant="outline" className="text-[11px] px-2 py-1">
                                #{t.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                   Página {page} de {totalPages || 1}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages || isLoading || totalPages === 0}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside
              ref={sidebarRef.ref}
              className={`space-y-6 transition-all duration-700 ${
                sidebarRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-foreground">Categorias</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoriesData?.map((c) => {
                    // Note: Counting posts per category on the client is not efficient or accurate with pagination.
                    // Ideally, the category list endpoint should return counts.
                    // For now, we skip the count or just show it if we had it.
                    return (
                      <Badge
                        key={c.id}
                        variant={category === c.name ? 'default' : 'outline'}
                        className={category === c.name ? 'btn-filter-selected cursor-pointer' : 'border-accent text-accent hover:bg-accent/10 cursor-pointer'}
                        onClick={() => {
                          setCategory(category === c.name ? null : c.name);
                          setPage(1);
                        }}
                      >
                        {c.name}
                      </Badge>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-foreground">Tags populares</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagsData?.map((t) => (
                    <Badge
                      key={t.id}
                      variant={tag === t.name ? 'default' : 'outline'}
                      className={tag === t.name ? 'btn-filter-selected cursor-pointer' : 'border-accent text-accent hover:bg-accent/10 cursor-pointer'}
                      onClick={() => {
                        setTag(tag === t.name ? null : t.name);
                        setPage(1);
                      }}
                    >
                      #{t.name}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-3 bg-card/95 border-accent/20">
                <p className="text-sm text-muted-foreground">
                  Gostou de algum tema? Traga para a sessão ou marque um horário para conversar sobre sua necessidade.
                </p>
                <Button className="w-full btn-lapis-lazuli hover:scale-105" onClick={() => (window.location.href = '/#agendamento')}>
                  Agendar consulta
                </Button>
              </Card>
            </aside>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />
      </main>

      <Footer />
    </div>
  );
}