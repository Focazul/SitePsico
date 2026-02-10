import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, BookOpen, Calendar, Clock, Link2, Linkedin, MessageCircle, Share2, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type BlogPostParams = {
  params: {
    slug: string;
  };
};

export default function BlogPost({ params }: BlogPostParams) {
  const { data: post, isLoading, error } = trpc.blog.getPost.useQuery({ slug: params.slug });
  const { data: related } = trpc.blog.getRelatedPosts.useQuery(
    { postId: post?.id || 0 },
    { enabled: !!post?.id }
  );

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [params.slug]);

  const formatDate = (date: Date | null | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, "dd MMM yyyy", { locale: ptBR });
  };

  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  if (isLoading) {
     return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Artigo não encontrado.</p>
            <Link href="/blog">
              <Button variant="outline">Voltar ao blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO */}
        <section className="pt-14 pb-10 md:pt-16 md:pb-12 section-light">
          <div className="container max-w-5xl space-y-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/blog" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <span>•</span>
              {post.category && (
                <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold text-[11px]">{post.category.name}</span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.publishedAt)}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {getReadTime(post.content)}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> Psicólogo Responsável</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{post.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t.id} variant="outline">#{t.name}</Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-center">
              <span className="font-semibold text-foreground flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</span>
              <Button
                variant="outline"
                size="sm"
                className="btn-outline-blue"
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}%20${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="btn-outline-blue"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="btn-outline-blue"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                <Link2 className="w-4 h-4 mr-1" /> Copiar link
              </Button>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* COVER IMAGE */}
        {post.coverImage && (
          <section className="bg-background">
            <div className="container max-w-5xl">
              <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  width="1200"
                  height="675"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}

        {/* CONTENT */}
        <section className="py-12 md:py-16">
          <div className="container max-w-4xl space-y-8 text-base leading-relaxed text-muted-foreground">
            <article className="space-y-6 prose prose-stone max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            <Card className="p-6 bg-card/95 border-accent/20 space-y-3">
              <p className="text-foreground font-semibold">Gostou do tema e quer falar sobre sua situação?</p>
              <div className="flex flex-wrap gap-3">
                <Button className="btn-lapis-lazuli hover:scale-105" onClick={() => (window.location.href = '/#agendamento')}>
                  Agendar consulta
                </Button>
                <Button variant="outline" className="btn-outline-blue" onClick={() => (window.location.href = '/#contato')}>
                  Enviar dúvida rápida
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* RELATED */}
        {related && related.length > 0 && (
          <section className="py-12 md:py-16 section-soft">
            <div className="container max-w-5xl space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Conteúdos relacionados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="block group">
                    <Card className="h-full border-border/60 hover:border-accent transition-all duration-200">
                      <div className="aspect-[16/9] bg-muted overflow-hidden">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            width="640"
                            height="360"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-accent/20" />
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {formatDate(item.publishedAt)}
                        </p>
                        <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                          {item.title}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}