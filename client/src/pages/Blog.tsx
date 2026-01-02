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
import { blogPosts } from './blogData';
import { BookOpen, Calendar, Clock, Filter, Search, Tag as TagIcon } from 'lucide-react';

const categories = Array.from(new Set(blogPosts.map((p) => p.category)));
const tags = Array.from(new Set(blogPosts.flatMap((p) => p.tags)));

const PAGE_SIZE = 6;

export default function Blog() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const listRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const sidebarRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const featured = useMemo(() => blogPosts.filter((p) => p.featured), []);

  const filtered = useMemo(() => {
    let posts = blogPosts;

    if (search.trim()) {
      const term = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.excerpt.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (category) {
      posts = posts.filter((p) => p.category === category);
    }

    if (tag) {
      posts = posts.filter((p) => p.tags.includes(tag));
    }

    return posts;
  }, [search, category, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const resetFilters = () => {
    setCategory(null);
    setTag(null);
    setPage(1);
    setSearch('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/10">
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
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => (window.location.href = '/#agendamento')}
                  >
                    Agendar uma conversa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = '/#contato')}
                  >
                    Enviar uma dúvida
                  </Button>
                </div>
              </div>

              <Card className="p-6 border-accent/30 shadow-lg bg-background/80 backdrop-blur">
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

        {/* FEATURED */}
        {featured.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-accent" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destaques</p>
                  <h2 className="text-2xl font-bold text-foreground">Artigos em evidência</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                    <Card className="overflow-hidden border-border/60 hover:border-accent transition-all duration-200 h-full">
                      <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                        <img
                          src={post.cover}
                          alt={post.title}
                          width="800"
                          height="450"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold text-[11px]">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <OrganicDivider color="secondary" className="mb-0" />

        {/* LISTING + SIDEBAR */}
        <section className="py-16 md:py-24">
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
                <div className="flex items-center gap-3 bg-muted/50 border border-border/60 rounded-xl px-4 py-3">
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
                    className={!category ? 'bg-accent text-accent-foreground' : ''}
                    onClick={() => {
                      setCategory(null);
                      setPage(1);
                    }}
                  >
                    Todas
                  </Button>
                  {categories.map((c) => (
                    <Button
                      key={c}
                      size="sm"
                      variant={category === c ? 'default' : 'outline'}
                      className={category === c ? 'bg-accent text-accent-foreground' : ''}
                      onClick={() => {
                        setCategory(c);
                        setPage(1);
                      }}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <TagIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                <Badge
                  variant={tag ? 'outline' : 'default'}
                  className={!tag ? 'bg-accent text-accent-foreground cursor-pointer' : 'cursor-pointer'}
                  onClick={() => {
                    setTag(null);
                    setPage(1);
                  }}
                >
                  Todas
                </Badge>
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant={tag === t ? 'default' : 'outline'}
                    className={tag === t ? 'bg-accent text-accent-foreground cursor-pointer' : 'cursor-pointer'}
                    onClick={() => {
                      setTag(t);
                      setPage(1);
                    }}
                  >
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginated.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group h-full">
                    <Card className="h-full overflow-hidden border-border/60 hover:border-accent hover:shadow-md transition-all duration-200">
                      <div className="aspect-[16/9] bg-muted overflow-hidden">
                        <img
                          src={post.cover}
                          alt={post.title}
                          width="800"
                          height="450"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold text-[11px]">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} artigo(s) | Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
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
                  {categories.map((c) => {
                    const count = blogPosts.filter((p) => p.category === c).length;
                    return (
                      <Badge
                        key={c}
                        variant={category === c ? 'default' : 'outline'}
                        className={category === c ? 'bg-accent text-accent-foreground cursor-pointer' : 'cursor-pointer'}
                        onClick={() => {
                          setCategory(category === c ? null : c);
                          setPage(1);
                        }}
                      >
                        {c} ({count})
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
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant={tag === t ? 'default' : 'outline'}
                      className={tag === t ? 'bg-accent text-accent-foreground cursor-pointer' : 'cursor-pointer'}
                      onClick={() => {
                        setTag(tag === t ? null : t);
                        setPage(1);
                      }}
                    >
                      #{t}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-foreground">Recentes</p>
                </div>
                <div className="space-y-2">
                  {blogPosts.slice(0, 5).map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                      <div className="p-3 rounded-lg border border-border/60 hover:border-accent transition-all">
                        <p className="text-sm font-semibold text-foreground group-hover:text-accent">{post.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {post.date}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-3 bg-accent/10 border-accent/40">
                <p className="text-sm text-muted-foreground">
                  Gostou de algum tema? Traga para a sessão ou marque um horário para conversar sobre sua necessidade.
                </p>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => (window.location.href = '/#agendamento')}>
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