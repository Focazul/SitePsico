import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import ImageGallery from '@/components/ImageGallery';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, Calendar, MessageCircle, Shield, Stethoscope } from 'lucide-react';

const areas = [
  {
    title: 'Ansiedade e Transtornos de Humor',
    summary: 'Estratégias para regulação emocional, redução de sintomas e retomada do equilíbrio diário.',
    detail: 'Uso de psicoeducação, técnicas cognitivo-comportamentais e treino de habilidades para manejo de ansiedade, estresse e prevenção de recaídas.',
  },
  {
    title: 'Autoestima e Autoconhecimento',
    summary: 'Fortalecimento da autoimagem, identificação de padrões e construção de narrativas mais saudáveis.',
    detail: 'Exploração de crenças centrais, valores pessoais e recursos internos para sustentar mudanças duradouras.',
  },
  {
    title: 'Relacionamentos Interpessoais',
    summary: 'Comunicação assertiva, limites saudáveis e resolução de conflitos.',
    detail: 'Ferramentas práticas para melhorar vínculos afetivos, familiares e profissionais com respeito mútuo.',
  },
  {
    title: 'Luto e Perdas',
    summary: 'Acolhimento das fases do luto e elaboração de significados.',
    detail: 'Processo seguro para lidar com perdas afetivas, rupturas ou mudanças abruptas de contexto.',
  },
  {
    title: 'Transições de Vida',
    summary: 'Apoio em mudanças importantes como maternidade, aposentadoria, mudanças de cidade ou carreira.',
    detail: 'Planejamento de rotinas, suporte emocional e construção de redes de apoio durante transições.',
  },
  {
    title: 'Desenvolvimento Pessoal',
    summary: 'Clareza de objetivos, organização e hábitos que sustentam crescimento.',
    detail: 'Definição de metas, construção de disciplina compassiva e acompanhamento de progresso.',
  },
  {
    title: 'Questões LGBTQIA+',
    summary: 'Espaço seguro e afirmativo para questões de identidade, expressão e relações.',
    detail: 'Atenção inclusiva, informada e atualizada sobre vivências LGBTQIA+, acolhendo desafios e celebrações.',
  },
  {
    title: 'Orientação de Carreira',
    summary: 'Decisões profissionais com alinhamento a propósito e bem-estar.',
    detail: 'Mapeamento de forças, valores e interesses, com foco em transições e satisfação no trabalho.',
  },
];

const modalities = [
  {
    title: 'Presencial',
    description: 'Consultório acolhedor em [Bairro, São Paulo], pensado para privacidade e conforto.',
    notes: 'Endereço informado no agendamento.',
    icon: <Stethoscope className="w-5 h-5 text-accent" />,
  },
  {
    title: 'Online',
    description: 'Atendimento seguro via plataforma confidencial, conforme Resolução CFP nº 11/2018.',
    notes: 'Mesma qualidade do atendimento presencial.',
    icon: <MessageCircle className="w-5 h-5 text-accent" />,
  },
];

export default function Services() {
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>({});
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const areasRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const modalitiesRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const galleryRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  const goToBooking = () => {
    window.location.href = '/#agendamento';
  };

  const toggleArea = (title: string) => {
    setOpenAreas((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO SERVIÇOS */}
        <section className="py-16 md:py-24 lg:py-28 bg-gradient-to-br from-accent/5 to-primary/5">
          <div className="container">
            <div
              ref={heroRef.ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="space-y-6">
                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">
                  Serviços e Áreas de Atuação
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Cuidado psicológico para sua jornada
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Atendimento presencial e online para apoiar sua saúde mental com ética, sigilo e base científica. Espalhe
                  uma rede de segurança para lidar com ansiedade, autoestima, relacionamentos e transições de vida.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-border/60">Atendimento Presencial e Online</Badge>
                  <Badge variant="outline" className="border-border/60">Sigilo Profissional</Badge>
                  <Badge variant="outline" className="border-border/60">Base em Evidências</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={goToBooking}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    Ver Disponibilidade
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border hover:border-accent hover:bg-muted"
                    onClick={() => (window.location.href = '/#contato')}
                  >
                    Falar agora
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-accent/15 rounded-3xl blur-3xl -z-10" />
                <Card className="p-6 md:p-8 border-accent/30 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-accent" />
                    <p className="font-semibold text-foreground">Sigilo e ética</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Toda a prática é guiada pelo Código de Ética Profissional e pela Resolução CFP nº 11/2018 para
                    atendimentos online. Transparência e segurança em cada passo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="font-semibold text-foreground">Sessões de 50 min</p>
                      <p>Duração padrão, com foco e estrutura.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="font-semibold text-foreground">Frequência semanal</p>
                      <p>A combinar conforme necessidade.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-accent" />
                    <p>Agendamento simples e confirmação em até 24h.</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* ÁREAS DE ATUAÇÃO */}
        <section className="py-16 md:py-24" ref={areasRef.ref}>
          <div className="container">
            <div className={`max-w-5xl mx-auto space-y-10 transition-all duration-700 ${areasRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Áreas de Atuação</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Demandas atendidas com abordagem integrativa e acolhedora.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.map((area) => {
                  const isOpen = openAreas[area.title];
                  return (
                    <Card
                      key={area.title}
                      className="p-4 border-border/60 hover:border-accent hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{area.title}</p>
                          <p className="text-sm text-muted-foreground mt-2">{area.summary}</p>
                        </div>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`Expandir detalhes de ${area.title}`}
                          className="p-2 rounded-full border border-border/60 hover:border-accent hover:bg-accent/10 transition-all duration-200"
                          onClick={() => toggleArea(area.title)}
                        >
                          <ArrowRight
                            className={`w-4 h-4 text-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                      {isOpen && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/60">
                          {area.detail}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* MODALIDADES */}
        <section className="py-16 md:py-24 bg-secondary/10" ref={modalitiesRef.ref}>
          <div className="container">
            <div className={`max-w-5xl mx-auto space-y-10 transition-all duration-700 ${modalitiesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Modalidades de Atendimento</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Escolha entre presencial ou online, mantendo a mesma qualidade de cuidado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modalities.map((item) => (
                  <Card
                    key={item.title}
                    className="p-6 border-accent/30 bg-accent/5 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <p className="text-lg font-bold text-foreground">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-3">{item.notes}</p>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="p-4 rounded-lg bg-background border border-border/60">
                  <p className="font-semibold text-foreground">Duração e Frequência</p>
                  <p>Sessões de 50 minutos; frequência semanal ou quinzenal, a combinar.</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border/60">
                  <p className="font-semibold text-foreground">Valores (placeholder)</p>
                  <p>Informados no primeiro contato; condições avaliadas caso a caso.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* GALERIA */}
        <section className="py-16 md:py-24" ref={galleryRef.ref}>
          <div className="container">
            <div className={`max-w-5xl mx-auto space-y-10 transition-all duration-700 ${galleryRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Consultório e Ambiente</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Um espaço pensado para acolher com conforto e privacidade.
                </p>
              </div>

              <ImageGallery
                images={[
                  {
                    src: '/images/growth-journey.jpg',
                    alt: 'Caminho de crescimento pessoal',
                    caption: 'Crescimento e desenvolvimento',
                  },
                  {
                    src: '/images/trust-connection.jpg',
                    alt: 'Conexão e confiança',
                    caption: 'Relação terapêutica baseada em confiança',
                  },
                  {
                    src: '/images/wellbeing-abstract.jpg',
                    alt: 'Bem-estar e equilíbrio',
                    caption: 'Ambiente calmo e equilibrado',
                  },
                ]}
                columns={3}
              />
            </div>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />
      </main>

      <Footer />
    </div>
  );
}