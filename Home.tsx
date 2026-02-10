import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Calendar, 
  Shield, 
  User, 
  ChevronRight,
  Quote
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import FAQSection from '@/components/FAQSection';
import ValuesSection from '@/components/ValuesSection';
import FadeIn from '@/components/FadeIn';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import ProfilePhoto from '@/components/ProfilePhoto';
import ImageGallery from '@/components/ImageGallery';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import ManusDialog from '@/components/ManusDialog';
import { trackFormSubmission } from '@/lib/analytics';

export default function Home() {
  const [, setLocation] = useLocation();
  const { config } = useSiteConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30">
      <Header />
      
      <main id="main-content" className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container">
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                {/* Texto Hero */}
                <div className="space-y-8 reveal">
                  <div className="space-y-4">
                    <p className="text-accent font-bold text-xs md:text-sm uppercase tracking-[0.3em]">
                      Bem-vindo(a)
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                      Espaço de escuta qualificada e segura
                    </h1>
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {config.aboutText || 'Sou psicólogo(a) graduado(a) e ofereço um espaço acolhedor onde você pode explorar seus pensamentos, emoções e desafios com confiança e sigilo profissional.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={() => openModal()}
                      className="btn-gradient h-14 px-8 text-lg"
                      size="lg"
                    >
                      Agendar Consulta
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => scrollToSection('sobre')}
                      variant="outline"
                      size="lg"
                      className="btn-outline-blue h-14 px-8 text-lg"
                    >
                      Conhecer Mais
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-3 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span className="font-medium">{config.psychologistCrp || 'CRP-SP'} Ativo</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span className="font-medium">Sigilo Garantido</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span className="font-medium">Atendimento Online</span>
                    </div>
                  </div>
                </div>

                {/* Imagem Hero Envolvida pelo Quadrado Azul (hero-shell) */}
                <div className="hidden md:block reveal delay-1">
                  <div className="hero-shell p-8 lg:p-12">
                    <div className="hero-media-frame shadow-2xl">
                      <img
                        src="/images/hero-psychologist.jpg"
                        alt="Ambiente acolhedor de terapia"
                        width="1200"
                        height="800"
                        fetchPriority="high"
                        className="hero-media-image"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* SOBRE MIM SECTION */}
        <section
          id="sobre"
          className="py-20 md:py-32 section-soft"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-5xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold title-accent-bg">
                    Sobre Mim
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Formação, experiência e compromisso ético
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                  <div className="flex flex-col items-center space-y-6">
                    <ProfilePhoto />
                    <div className="text-center">
                      <p className="font-bold text-2xl">{config.psychologistName || 'Nome do Psicólogo'}</p>
                      <p className="text-accent font-semibold text-lg">{config.psychologistSpecialty || 'Psicólogo Clínico'}</p>
                      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.2em] font-bold">{config.psychologistCrp || 'CRP 06/00000'}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-xl leading-relaxed text-foreground/90 font-medium">
                        {config.psychologistBio || 'Breve biografia descrevendo sua trajetória profissional, abordagem teórica e como você auxilia seus pacientes no processo terapêutico.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-6 rounded-[18px] bg-white border border-accent/10 shadow-sm">
                        <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          Formação
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {config.psychologistEducation || 'Graduação em Psicologia e especializações relevantes.'}
                        </p>
                      </div>
                      <div className="p-6 rounded-[18px] bg-white border border-accent/10 shadow-sm">
                        <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          Abordagem
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          Trabalho fundamentado na ética profissional e no acolhimento integral do ser humano.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* SERVICES SECTION */}
        <section id="servicos" className="py-20 md:py-32 section-light">
          <div className="container">
            <FadeIn>
              <div className="space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold title-accent-bg">
                    Áreas de Atuação
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {config.servicesText || 'Ofereço suporte especializado para diversas demandas, sempre com foco no seu bem-estar e desenvolvimento pessoal.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: 'Psicoterapia Individual',
                      desc: 'Espaço para autoconhecimento e tratamento de questões emocionais, ansiedade e depressão.',
                      icon: <User className="w-8 h-8" />
                    },
                    {
                      title: 'Atendimento Online',
                      desc: 'Sessões por videochamada com a mesma eficácia e sigilo do presencial, no conforto do seu lar.',
                      icon: <MessageCircle className="w-8 h-8" />
                    },
                    {
                      title: 'Orientação Profissional',
                      desc: 'Auxílio na escolha de carreira ou transição profissional baseada em seus valores e objetivos.',
                      icon: <Calendar className="w-8 h-8" />
                    }
                  ].map((service, i) => (
                    <div key={i} className="p-10 rounded-[18px] bg-white border border-accent/10 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all group">
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">{service.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <ValuesSection />
        
        <FAQSection />

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 skew-x-12 translate-x-1/2" />
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight font-serif">
                Dê o primeiro passo em direção ao seu bem-estar emocional
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">
                Agende uma sessão inicial e descubra como a psicoterapia pode transformar sua relação consigo e com o mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                <Button 
                  size="lg" 
                  className="bg-accent text-white hover:bg-accent/90 px-10 h-16 text-xl font-bold rounded-full shadow-xl"
                  onClick={() => openModal()}
                >
                  Agendar Consulta Agora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 px-10 h-16 text-xl font-bold rounded-full"
                  onClick={() => scrollToSection('contato')}
                >
                  Tirar Dúvidas
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
      
      <ManusDialog 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Agendar Consulta"
      />
    </div>
  );
}
