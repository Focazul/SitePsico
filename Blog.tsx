import { useMemo, useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  Tag as TagIcon, 
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAGE_SIZE = 6;

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [page, search, category]);

  const { data: categoriesData } = trpc.blog.getCategories.useQuery();
  const { data: tagsData } = trpc.blog.getTags.useQuery();

  const selectedCategoryId = useMemo(() => {
    if (!category || !categoriesData) return undefined;
    return categoriesData.find(c => c.name === category)?.id;
  }, [category, categoriesData]);

  const selectedTagId = useMemo(() => {
    if (!tag || !tagsData) return undefined;
    return tagsData.find(t => t.name === tag)?.id;
  }, [tag, tagsData]);

  const isSearch = search.length > 0;

  const searchPostsQuery = trpc.blog.searchPosts.useQuery(
    { query: search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    { enabled: isSearch }
  );

  const getPostsQuery = trpc.blog.getPosts.useQuery(
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, categoryId: selectedCategoryId, tagId: selectedTagId },
    { enabled: !isSearch }
  );

  const postsData = isSearch ? searchPostsQuery.data : getPostsQuery.data;
  const isLoading = isSearch ? searchPostsQuery.isLoading : getPostsQuery.isLoading;
  const posts = postsData?.posts || [];
  const totalCount = postsData?.count || 0;
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
    return format(d, "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    return `${Math.ceil(words / 200)} min de leitura`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30">
      <Header />

      <main id="main-content" className="flex-1 relative overflow-x-hidden">
        {/* BACKGROUND DECORATION */}
        <div className="bg-blob w-[600px] h-[600px] -top-48 -right-24 opacity-10" />
        <div className="bg-blob w-[400px] h-[400px] top-[40%] -left-24 bg-primary/5" />

        {/* HERO REFINADO */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-20">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 reveal-on-scroll active">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                <BookOpen className="w-3 h-3" />
                Blog e Conteúdo
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-primary leading-tight font-serif">
                Explorando a <span className="text-accent italic">Saúde Mental</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
                Artigos e reflexões para apoiar sua jornada de autoconhecimento e bem-estar emocional.
              </p>
              
              {/* BUSCA PREMIUM */}
              <div className="max-w-2xl mx-auto pt-8">
                <div className="relative group reveal-on-scroll active delay-200">
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-focus-within:bg-accent/40 transition-all duration-500" />
                  <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-accent/20 rounded-2xl p-2 shadow-xl">
                    <Search className="w-6 h-6 text-accent ml-4" />
                    <Input
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="O que você está buscando hoje?"
                      className="border-0 bg-transparent text-lg h-14 focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    />
                    {isSearch && (
                      <Button variant="ghost" onClick={resetFilters} className="mr-2 text-accent font-bold">
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" />

        {/* CONTEÚDO PRINCIPAL */}
        <section className="py-20 md:py-28 section-soft">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* SIDEBAR / FILTROS */}
              <aside className="lg:col-span-3 space-y-12 reveal-on-scroll">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Filter className="w-5 h-5 text-accent" />
                    Categorias
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setCategory(null); setPage(1); }}
                      className={`text-left px-4 py-3 rounded-xl transition-all duration-300 font-bold ${!category ? 'bg-primary text-white shadow-lg' : 'hover:bg-accent/10 text-primary/70'}`}
                    >
                      Todas as Categorias
                    </button>
                    {categoriesData?.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setCategory(c.name); setPage(1); }}
                        className={`text-left px-4 py-3 rounded-xl transition-all duration-300 font-bold ${category === c.name ? 'bg-primary text-white shadow-lg' : 'hover:bg-accent/10 text-primary/70'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-primary text-white space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <Sparkles className="w-8 h-8 text-accent" />
                  <h4 className="text-2xl font-bold font-serif">Precisa de suporte agora?</h4>
                  <p className="text-white/70 leading-relaxed">
                    Não espere para cuidar de você. Agende uma conversa hoje mesmo.
                  </p>
                  <Button onClick={() => window.location.href='/agendamento'} className="w-full bg-accent hover:bg-white hover:text-primary text-white h-14 rounded-xl font-bold transition-all">
                    Agendar Consulta
                  </Button>
                </div>
              </aside>

              {/* LISTAGEM DE POSTS */}
              <div className="lg:col-span-9 space-y-12">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-primary font-bold animate-pulse">Buscando conteúdos...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {posts.map((post, i) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                          <Card className="card-premium group cursor-pointer border-0 overflow-hidden reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                            <div className="aspect-[16/10] overflow-hidden relative">
                              <img
                                src={post.coverImage || '/images/blog-placeholder.jpg'}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 backdrop-blur text-primary border-0 font-bold px-3 py-1 rounded-lg">
                                  {post.category?.name || 'Geral'}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-8 space-y-4">
                              <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt || post.createdAt)}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getReadTime(post.content)}</span>
                              </div>
                              <h3 className="text-2xl font-bold text-primary group-hover:text-accent transition-colors leading-tight font-serif">
                                {post.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.excerpt || post.content.substring(0, 120).replace(/[#*`]/g, '') + '...'}
                              </p>
                              <div className="pt-4 flex items-center text-primary font-bold group-hover:gap-3 transition-all">
                                Ler artigo completo <ArrowRight className="w-5 h-5 ml-2 text-accent" />
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* PAGINAÇÃO PREMIUM */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 pt-12">
                        <Button
                          variant="outline"
                          disabled={page === 1}
                          onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="rounded-xl border-accent/20 text-primary hover:bg-accent/10"
                        >
                          <ChevronLeft className="w-5 h-5 mr-2" /> Anterior
                        </Button>
                        <div className="flex gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? 'bg-primary text-white shadow-lg' : 'hover:bg-accent/10 text-primary/60'}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          disabled={page === totalPages}
                          onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="rounded-xl border-accent/20 text-primary hover:bg-accent/10"
                        >
                          Próximo <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-32 space-y-6 reveal-on-scroll active">
                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold text-primary">Nenhum artigo encontrado</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Não encontramos resultados para sua busca. Tente usar termos mais genéricos ou explore nossas categorias.
                    </p>
                    <Button onClick={resetFilters} variant="outline" className="border-accent text-accent font-bold">
                      Ver todos os artigos
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
