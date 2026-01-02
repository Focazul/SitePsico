import { Heart, Shield, BookOpen, MessageCircle, Users, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * ValuesSection Component
 * Seção dedicada aos valores e princípios que guiam a prática profissional
 * Design: Cards com ícones e descrições, layout responsivo
 */

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <Heart className="w-6 h-6 text-accent" />,
    title: 'Acolhimento',
    description:
      'Criação de um espaço seguro, livre de julgamentos, onde você pode ser autêntico(a) e compartilhar suas vulnerabilidades com confiança.',
  },
  {
    icon: <Shield className="w-6 h-6 text-accent" />,
    title: 'Sigilo Profissional',
    description:
      'Garantia absoluta de confidencialidade em todas as situações. O que é dito na terapia permanece na terapia.',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-accent" />,
    title: 'Fundamentação Científica',
    description:
      'Técnicas e abordagens baseadas em evidências científicas, sempre atualizadas e respaldadas pela pesquisa em psicologia.',
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-accent" />,
    title: 'Escuta Qualificada',
    description:
      'Atenção plena e compreensão empática em cada sessão. Sua história é única e merece ser ouvida com respeito.',
  },
  {
    icon: <Users className="w-6 h-6 text-accent" />,
    title: 'Respeito à Diversidade',
    description:
      'Acolhimento de todas as pessoas, independente de gênero, orientação sexual, raça, religião ou background. Espaço inclusivo e respeitoso.',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-accent" />,
    title: 'Autonomia e Empoderamento',
    description:
      'O objetivo é que você desenvolva ferramentas para lidar com seus desafios. A terapia é um processo colaborativo e não de dependência.',
  },
];

export default function ValuesSection() {
  return (
    <section id="valores" className="py-16 md:py-24 bg-secondary/10">
      <div className="container">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Valores e Princípios
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              O que guia minha prática clínica e meu compromisso com você
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="p-6 border-border/50 hover:border-accent/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Icon Container */}
                  <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-300">
                    {value.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer Quote */}
          <div className="pt-8 text-center">
            <blockquote className="max-w-2xl mx-auto">
              <p className="text-lg italic text-muted-foreground">
                "A psicoterapia é um espaço de acolhimento, crescimento e transformação. 
                Meu compromisso é caminhar ao seu lado, respeitando seu tempo e sua história."
              </p>
              <footer className="mt-4 text-sm text-muted-foreground/80">
                — Compromisso Profissional
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
