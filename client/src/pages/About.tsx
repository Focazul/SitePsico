import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import ImageGallery from '@/components/ImageGallery';
import ProfilePhoto from '@/components/ProfilePhoto';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ArrowRight, BookOpen, GraduationCap, Heart, Shield } from 'lucide-react';

const education = [
  {
    title: 'Graduação em Psicologia',
    institution: '[Universidade]',
    year: '[Ano de conclusão]',
    detail: 'Formação em Psicologia com foco em clínica e saúde mental.',
  },
  {
    title: 'Especialização (em curso)',
    institution: '[Instituição]',
    year: '[Ano previsto]',
    detail: 'Aprofundamento teórico e prático em abordagem integrativa.',
  },
];

const experience = [
  {
    period: '[Ano – Atual]',
    role: 'Psicólogo(a) Clínico(a)',
    place: '[Consultório / Clínica]',
    description: 'Atendimento a adultos em modalidade presencial e online, com foco em saúde mental, autoconhecimento e relacionamentos.',
  },
  {
    period: '[Ano – Ano]',
    role: 'Estágio Clínico Supervisionado',
    place: '[Instituição]',
    description: 'Atendimento supervisionado, desenvolvimento de habilidades de escuta, acolhimento e formulação de casos.',
  },
];

const certifications = [
  'CRP 06/[Número] ativo',
  'Formação continuada em abordagem integrativa',
  'Cursos de atualização em saúde mental e ansiedade',
  'Workshops de ética profissional e sigilo',
];

const associations = [
  'Conselho Regional de Psicologia de São Paulo (CRP-SP)',
  'Participação em grupos de estudo (placeholder)',
  'Comunidades de prática clínica (placeholder)',
];

export default function About() {
  const heroRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const timelineRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const galleryRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  const scrollToHomeCTA = () => {
    window.location.href = '/#agendamento';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        {/* HERO SOBRE */}
        <section className="py-16 md:py-24 lg:py-28">
          <div className="container">
            <div
              ref={heroRef.ref}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="space-y-6">
                <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">
                  Sobre o meu trabalho
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Psicoterapia com acolhimento, ética e ciência
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Meu compromisso é oferecer um espaço seguro, sigiloso e respeitoso para que você possa explorar suas
                  experiências, emoções e objetivos de vida. Trabalho de forma integrativa, com base em evidências
                  científicas e atualização constante.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-accent/10 text-accent border-accent/30">CRP 06/[Número]</Badge>
                  <Badge variant="outline" className="border-border/60">Atendimento Presencial e Online</Badge>
                  <Badge variant="outline" className="border-border/60">Sigilo Profissional</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={scrollToHomeCTA}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    Agendar Consulta
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border hover:border-accent hover:bg-muted"
                    onClick={() => window.location.href = '/'}
                  >
                    Voltar à Home
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-accent/15 rounded-3xl blur-3xl -z-10" />
                <div className="flex flex-col items-center gap-6">
                  <ProfilePhoto src="/images/hero-psychologist.jpg" alt="Foto profissional" size="xl" />
                  <Card className="w-full p-6 space-y-3 border-accent/30 shadow-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Acolhimento e ética</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atendimento humanizado, respeitando sua singularidade, com sigilo absoluto e compromisso ético.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* FORMAÇÃO E ESPECIALIZAÇÃO */}
        <section className="py-16 md:py-24 bg-secondary/10">
          <div className="container">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Formação e Especialização</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Trajetória acadêmica e desenvolvimento contínuo para oferecer um cuidado fundamentado em ciência.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {education.map((item, idx) => (
                  <Card key={idx} className="p-6 border-border/60 hover:border-accent/50 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <GraduationCap className="w-5 h-5 text-accent" />
                      <p className="text-sm text-muted-foreground">{item.year}</p>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.institution}</p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.detail}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* TRAJETÓRIA PROFISSIONAL */}
        <section className="py-16 md:py-24" ref={timelineRef.ref}>
          <div className="container">
            <div
              className={`max-w-4xl mx-auto space-y-10 transition-all duration-700 ${
                timelineRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trajetória Profissional</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experiências que moldam minha forma de atuar com responsabilidade e empatia.
                </p>
              </div>

              <div className="space-y-6">
                {experience.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      {idx < experience.length - 1 && <div className="flex-1 w-px bg-border" />}
                    </div>
                    <Card className="flex-1 p-6 border-border/60 hover:border-accent/50 transition-colors duration-200">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-sm font-semibold text-accent">{item.period}</p>
                          <h3 className="text-lg font-bold text-foreground">{item.role}</h3>
                          <p className="text-sm text-muted-foreground">{item.place}</p>
                        </div>
                        <Badge variant="outline" className="border-border/60">Clínica</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* FILOSOFIA E MISSÃO */}
        <section className="py-16 md:py-24 bg-secondary/10">
          <div className="container">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-4">
                <Badge variant="outline" className="border-border/60">Filosofia de Trabalho</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Minha missão como psicólogo(a)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Construir um espaço onde você possa se sentir ouvido(a), compreendido(a) e seguro(a) para explorar suas
                  experiências. Acredito na psicoterapia como um processo colaborativo, pautado em evidências científicas e
                  na ética profissional.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4 border-border/60">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Sigilo e Ética</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sigilo absoluto e respeito ao Código de Ética Profissional.
                    </p>
                  </Card>
                  <Card className="p-4 border-border/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Base Científica</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Atualização contínua e técnicas fundamentadas em evidências.
                    </p>
                  </Card>
                  <Card className="p-4 border-border/60">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Acolhimento</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Espaço seguro, sem julgamentos, com escuta qualificada.
                    </p>
                  </Card>
                  <Card className="p-4 border-border/60">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-foreground">Desenvolvimento Contínuo</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Formação continuada para entregar o melhor cuidado possível.
                    </p>
                  </Card>
                </div>
              </div>

              <Card className="p-6 border-accent/30 bg-accent/5">
                <h3 className="text-xl font-bold text-foreground mb-4">Certificações e Associações</h3>
                <div className="space-y-3">
                  {certifications.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Associações</p>
                  {associations.map((item, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">• {item}</p>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* GALERIA DO CONSULTÓRIO */}
        <section className="py-16 md:py-24" ref={galleryRef.ref}>
          <div className="container">
            <div
              className={`max-w-5xl mx-auto space-y-10 transition-all duration-700 ${
                galleryRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Consultório e Ambiente</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Um espaço pensado para acolher, com conforto e privacidade.
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