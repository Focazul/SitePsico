export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  cover: string;
  date: string;
  readTime: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'o-que-e-psicoterapia',
    title: 'O que é psicoterapia e como funciona?',
    category: 'Psicoterapia',
    tags: ['psicoterapia', 'processo', 'saude-mental'],
    excerpt: 'Entenda o que acontece nas sessões, os objetivos e como a terapia pode apoiar seu bem-estar.',
    cover: '/images/blog-therapy-journey.jpg',
    date: '10 jan 2025',
    readTime: '7 min',
    featured: true,
  },
  {
    slug: 'preciso-de-terapia',
    title: 'Como saber se preciso de terapia?',
    category: 'Autoconhecimento',
    tags: ['autocuidado', 'ansiedade', 'sinais'],
    excerpt: 'Sinais comuns de que pode ser o momento de buscar apoio psicológico e como dar o primeiro passo.',
    cover: '/images/blog-need-therapy.jpg',
    date: '22 dez 2024',
    readTime: '6 min',
    featured: true,
  },
  {
    slug: 'primeira-sessao',
    title: 'O que esperar da primeira sessão',
    category: 'Psicoterapia',
    tags: ['primeira-sessao', 'expectativas'],
    excerpt: 'Como se preparar, o que levar e quais perguntas costumam surgir no primeiro encontro.',
    cover: '/images/blog-first-session.jpg',
    date: '05 dez 2024',
    readTime: '5 min',
  },
  {
    slug: 'psicologo-psiquiatra-psicanalista',
    title: 'Diferença entre psicólogo, psiquiatra e psicanalista',
    category: 'Educação em Saúde',
    tags: ['orientacao', 'saude-mental'],
    excerpt: 'Entenda os papéis de cada profissional para escolher o cuidado adequado às suas necessidades.',
    cover: '/images/blog-professions.jpg',
    date: '18 nov 2024',
    readTime: '8 min',
  },
  {
    slug: 'terapia-online-beneficios',
    title: 'Terapia online: benefícios e como funciona',
    category: 'Terapia Online',
    tags: ['online', 'tecnologia', 'sigilo'],
    excerpt: 'Vantagens, requisitos técnicos e como manter a privacidade nas sessões virtuais.',
    cover: '/images/blog-telehealth.jpg',
    date: '02 nov 2024',
    readTime: '6 min',
  },
  {
    slug: 'como-escolher-psicologo',
    title: 'Como escolher um psicólogo',
    category: 'Autoconhecimento',
    tags: ['escolha', 'criterios', 'confiança'],
    excerpt: 'Critérios práticos para avaliar alinhamento, abordagem e ética profissional.',
    cover: '/images/blog-choose-therapist.jpg',
    date: '20 out 2024',
    readTime: '7 min',
  },
  {
    slug: 'ansiedade-quando-buscar-ajuda',
    title: 'Ansiedade: sinais e quando buscar ajuda',
    category: 'Saúde Emocional',
    tags: ['ansiedade', 'sintomas', 'tratamento'],
    excerpt: 'Identifique sintomas, gatilhos e caminhos de apoio profissional para ansiedade.',
    cover: '/images/blog-anxiety.jpg',
    date: '08 out 2024',
    readTime: '6 min',
  },
  {
    slug: 'saude-mental-no-trabalho',
    title: 'Saúde mental no trabalho',
    category: 'Vida Profissional',
    tags: ['trabalho', 'estresse', 'equilibrio'],
    excerpt: 'Estratégias para lidar com pressão, burnout e cultivar limites saudáveis no trabalho.',
    cover: '/images/blog-workplace.jpg',
    date: '25 set 2024',
    readTime: '9 min',
  },
];