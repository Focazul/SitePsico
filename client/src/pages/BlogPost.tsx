import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { blogPosts } from './blogData';
import { ArrowLeft, BookOpen, Calendar, Clock, Link2, Linkedin, MessageCircle, Share2, User } from 'lucide-react';

type BlogPostParams = {
  params: {
    slug: string;
  };
};

export default function BlogPost({ params }: BlogPostParams) {
  const post = useMemo(() => blogPosts.find((p) => p.slug === params.slug), [params.slug]);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [params.slug]);

  const related = useMemo(() => {
    if (!post) return [];
    return blogPosts.filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))).slice(0, 3);
  }, [post]);

  if (!post) {
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
        <section className="pt-14 pb-10 md:pt-16 md:pb-12 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/10">
          <div className="container max-w-5xl space-y-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/blog" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <span>•</span>
              <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold text-[11px]">{post.category}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> Psicólogo Responsável</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{post.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="outline">#{t}</Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-center">
              <span className="font-semibold text-foreground flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}%20${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                <Link2 className="w-4 h-4 mr-1" /> Copiar link
              </Button>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* COVER IMAGE */}
        <section className="bg-background">
          <div className="container max-w-5xl">
            <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
              <img 
                src={post.cover} 
                alt={post.title} 
                width="1200" 
                height="675" 
                className="w-full h-auto object-cover" 
                loading="lazy" 
              />
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-12 md:py-16">
          <div className="container max-w-4xl space-y-8 text-base leading-relaxed text-muted-foreground">
            <article className="space-y-6">
              <p>
                Este conteúdo é informativo e não substitui avaliação individual. Cada pessoa possui contexto único; para orientação personalizada, agende uma sessão.
              </p>

              <h2 className="text-2xl font-semibold text-foreground">Por que este tema importa</h2>
              <p>
                Entender o papel da psicoterapia ajuda a reduzir estigmas e facilita a busca por cuidado qualificado. Aqui trazemos conceitos-chave de forma acessível, alinhados a boas práticas e ética profissional.
              </p>

              <h3 className="text-xl font-semibold text-foreground">O que você encontra nas sessões</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Escuta ativa, sigilosa e sem julgamentos.</li>
                <li>Clareza de objetivos terapêuticos e combinações de frequência.</li>
                <li>Ferramentas práticas para manejo emocional e tomada de decisão.</li>
                <li>Referenciamento responsável quando necessário (ex.: psiquiatria).</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">Como se preparar</h3>
              <p>
                Anote dúvidas, expectativas e situações que deseja abordar. Preparar-se ajuda a aproveitar melhor o tempo da sessão e a construir um plano de cuidado consistente.
              </p>

              <h3 className="text-xl font-semibold text-foreground">Sinais de que vale buscar apoio</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Sintomas persistentes de ansiedade, tristeza ou irritabilidade.</li>
                <li>Dificuldade para dormir, concentrar ou manter rotinas.</li>
                <li>Conflitos recorrentes em relacionamentos pessoais ou profissionais.</li>
                <li>Momentos de transição (mudança de trabalho, cidade, ciclo de vida) que geram sobrecarga.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground">Lembrete importante</h3>
              <p>
                Conteúdos online são complementares. Para avaliação, diagnóstico e condução do tratamento, marque uma sessão com um profissional habilitado e registrado no conselho regional.
              </p>
            </article>

            <Card className="p-6 bg-accent/10 border-accent/40 space-y-3">
              <p className="text-foreground font-semibold">Gostou do tema e quer falar sobre sua situação?</p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => (window.location.href = '/#agendamento')}>
                  Agendar consulta
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = '/#contato')}>
                  Enviar dúvida rápida
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* RELATED */}
        {related.length > 0 && (
          <section className="py-12 md:py-16 bg-secondary/10">
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
                        <img
                          src={item.cover}
                          alt={item.title}
                          width="640"
                          height="360"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {item.date}
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