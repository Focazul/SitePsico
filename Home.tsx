import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle, 
  MessageCircle, 
  Calendar, 
  User, 
  Shield,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import FAQSection from '@/components/FAQSection';
import ValuesSection from '@/components/ValuesSection';
import FadeIn from '@/components/FadeIn';
import ProfilePhoto from '@/components/ProfilePhoto';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import ManusDialog from '@/components/ManusDialog';

export default function Home() {
  const [, setLocation] = useLocation();
  const { config } = useSiteConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/30 overflow-x-hidden">
      <Header />
      
      <main id="main-content" className="flex-1 relative z-10">
        {/* Decorative Background Blobs */}
        <div className="bg-blob w-[500px] h-[500px] top-[-100px] left-[-100px]" />
        <div className="bg-blob w-[400px] h-[400px] bottom-[20%] right-[-50px] bg-primary/10" />

        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Texto Hero */}
              <div className="space-y-10 reveal-on-scroll">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-xs uppercase tracking-[0.3em]">
                    <Sparkles className="w-3 h-3" />
                    Bem-vindo(a)
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-primary">
                    Espaço de escuta <span className="text-accent italic">qualificada</span> e segura
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                  {config.aboutText || 'Ofereço um espaço acolhedor onde você pode explorar seus pensamentos e desafios com total sigilo profissional.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <Button
                    onClick={() => openModal()}
                    className="btn-premium h-16 px-10 text-xl shadow-2xl"
                  >
                    Agendar Consulta
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={() => scrollToSection('sobre')}
                    variant="outline"
                    className="btn-outline-blue h-16 px-10 text-xl hover:bg-primary/5"
                  >
                    Conhecer Mais
                  </Button>
                </div>

                {/* Trust Badges Refinados */}
                <div className="flex flex-wrap gap-4 pt-8">
                  {[
                    { icon: <Shield className="w-5 h-5" />, text: `${config.psychologistCrp || 'CRP-SP'} Ativo` },
                    { icon: <CheckCircle className="w-5 h-5" />, text: 'Sigilo Absoluto' },
                    { icon: <MessageCircle className="w-5 h-5" />, text: 'Atendimento Online' }
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-accent/10 shadow-sm text-sm font-bold text-primary/80">
                      <span className="text-accent">{badge.icon}</span>
                      {badge.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagem Hero 3D Shell */}
              <div className="hidden lg:block reveal-on-scroll active delay-300">
                <div className="hero-shell">
                  <div className="hero-media-frame">
                    <img
                      src="/images/hero-psychologist.jpg"
                      alt="Consultório de Psicologia"
                      className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" />

        {/* SOBRE MIM SECTION */}
        <section id="sobre" className="py-24 md:py-32 section-soft relative overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-8 reveal-on-scroll">
                <div className="relative group">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/40 transition-all duration-500" />
                  <ProfilePhoto />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">{config.psychologistName || 'Nome do Psicólogo'}</h3>
                  <p className="text-accent font-bold tracking-widest uppercase text-sm">{config.psychologistSpecialty || 'Psicólogo Clínico'}</p>
                  <div className="inline-block px-3 py-1 rounded-lg bg-primary/5 text-xs font-bold text-primary/60 mt-4 border border-primary/10">
                    {config.psychologistCrp || 'CRP 06/00000'}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-12 reveal-on-scroll delay-200">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold title-accent-bg pb-4">Sua jornada de autoconhecimento começa aqui</h2>
                  <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed font-medium italic border-l-4 border-accent pl-6 py-2">
                    "{config.psychologistBio || 'Acredito que a psicoterapia é um caminho de liberdade e acolhimento para as dores da alma.'}"
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card-premium group">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Minha Formação</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {config.psychologistEducation || 'Especialista em saúde mental com foco em abordagens humanistas e fenomenológicas.'}
                    </p>
                  </div>
                  <div className="card-premium group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Ética e Sigilo</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Atendimento pautado rigorosamente pelo Código de Ética Profissional do Psicólogo, garantindo sua total segurança.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <OrganicDivider color="secondary" />

        {/* SERVICES SECTION */}
        <section id="servicos" className="py-24 md:py-32 section-light">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
              <h2 className="text-4xl md:text-6xl font-bold title-accent-bg mb-8">Áreas de Atuação</h2>
              <p className="text-xl text-muted-foreground font-medium">
                Suporte especializado para suas necessidades emocionais e desenvolvimento pessoal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: 'Psicoterapia Individual', icon: <User />, color: 'accent' },
                { title: 'Atendimento Online', icon: <MessageCircle />, color: 'primary' },
                { title: 'Orientação de Carreira', icon: <Calendar />, color: 'secondary' }
              ].map((service, i) => (
                <div key={i} className="card-premium group reveal-on-scroll" style={{ transitionDelay: `${i * 200}ms` }}>
                  <div className={`w-20 h-20 rounded-2xl bg-${service.color}/10 flex items-center justify-center text-${service.color} mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Processo focado em resultados reais e transformações profundas na sua qualidade de vida.
                  </p>
                  <ChevronRight className="mt-8 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <ValuesSection />
        <FAQSection />

        {/* FINAL CTA - ULTRA PREMIUM */}
        <section className="py-32 relative overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)]" />
          <div className="container relative z-10 text-center space-y-12 reveal-on-scroll">
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto font-serif">
              Pronto para iniciar sua <span className="text-accent italic underline decoration-accent/30 underline-offset-8">transformação</span>?
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-medium">
              Agende sua primeira conversa e sinta a diferença de um acompanhamento profissional dedicado.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-6">
              <Button 
                onClick={() => openModal()}
                className="bg-accent text-white hover:bg-white hover:text-primary px-12 h-20 text-2xl font-black rounded-full shadow-[0_20px_50px_rgba(201,169,97,0.3)] transition-all duration-500 scale-110"
              >
                Agendar Agora
              </Button>
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

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
