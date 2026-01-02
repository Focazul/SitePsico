import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FAQ Section Component
 * Perguntas frequentes sobre terapia e atendimento
 * Design: Minimalismo Humanista com accordion interativo
 */

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Como funciona a primeira consulta?',
    answer:
      'A primeira consulta é um momento de conhecimento mútuo. É onde conversamos sobre suas expectativas, dúvidas e o que te trouxe até aqui. Também explico como funciona o processo terapêutico, tiramos dúvidas sobre sigilo, frequência das sessões e construímos juntos os objetivos do tratamento. Não há pressão para que você compartilhe mais do que se sente confortável.',
  },
  {
    question: 'Qual a duração de cada sessão?',
    answer:
      'Cada sessão tem duração de 50 minutos, conforme padrão estabelecido pela categoria. Esse tempo é cuidadosamente estruturado para permitir um trabalho terapêutico profundo e efetivo, respeitando limites saudáveis.',
  },
  {
    question: 'Com que frequência devo fazer terapia?',
    answer:
      'A frequência é definida em conjunto, considerando suas necessidades e disponibilidade. O mais comum é uma sessão semanal, que permite continuidade e aprofundamento do processo terapêutico. Em alguns casos, podemos avaliar frequências diferentes.',
  },
  {
    question: 'O sigilo profissional é garantido?',
    answer:
      'Sim, absolutamente. O sigilo profissional é um dos pilares fundamentais da psicologia e está previsto no Código de Ética da profissão. Tudo o que é conversado nas sessões é estritamente confidencial, salvo situações específicas previstas em lei (risco iminente de vida).',
  },
  {
    question: 'Quanto tempo dura um processo terapêutico?',
    answer:
      'Não existe um tempo pré-determinado. A duração varia de acordo com seus objetivos, demandas e o ritmo do seu processo. Algumas pessoas buscam terapia por questões pontuais, outras para um trabalho mais profundo e prolongado. Isso será construído e avaliado ao longo do caminho.',
  },
  {
    question: 'Qual a diferença entre psicólogo, psiquiatra e psicanalista?',
    answer:
      'O psicólogo é graduado em Psicologia e oferece psicoterapia através de diferentes abordagens. O psiquiatra é médico especializado em saúde mental, podendo prescrever medicamentos. O psicanalista é um profissional (que pode ser psicólogo ou médico) que atua especificamente pela abordagem psicanalítica. Cada profissional tem seu papel e, muitas vezes, o trabalho conjunto é benéfico.',
  },
  {
    question: 'Atendimento online funciona tão bem quanto presencial?',
    answer:
      'Sim! Pesquisas científicas demonstram que a terapia online é tão eficaz quanto a presencial quando há boa conexão de internet e um espaço privado. O atendimento online é regulamentado pelo Conselho Federal de Psicologia (Resolução CFP nº 11/2018) e oferece a mesma qualidade, mantendo todos os princípios éticos.',
  },
  {
    question: 'Como sei se preciso de terapia?',
    answer:
      'Não existe um "momento certo" único. Você pode buscar terapia se está enfrentando dificuldades emocionais, passando por momentos de transição, sentindo-se perdido(a), com dificuldades nos relacionamentos, ou simplesmente buscando autoconhecimento e desenvolvimento pessoal. A terapia não é só para "quem está mal" - é para quem quer cuidar da sua saúde mental.',
  },
  {
    question: 'Posso fazer terapia mesmo sem um "problema sério"?',
    answer:
      'Com certeza! A terapia não é apenas para crises ou transtornos graves. É um espaço de autoconhecimento, desenvolvimento pessoal e prevenção. Muitas pessoas buscam terapia para entender melhor seus padrões, melhorar relacionamentos ou simplesmente ter um espaço de escuta qualificada.',
  },
  {
    question: 'Qual o valor da consulta?',
    answer:
      'Os valores são informados individualmente no primeiro contato ou durante a primeira sessão. Acredito que é importante conversarmos sobre suas possibilidades e necessidades para encontrarmos um formato que funcione para ambos, sempre respeitando o valor social do trabalho profissional.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-secondary/10">
      <div className="container">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas sobre psicoterapia e atendimento
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-border/50 rounded-lg px-6 hover:border-accent/50 transition-colors duration-200"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent transition-colors py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas? Entre em contato!
            </p>
            <a
              href="#contato"
              className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200"
            >
              Falar Comigo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
