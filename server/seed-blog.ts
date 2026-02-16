/**
 * Script para popular o blog com dados de exemplo para desenvolvimento
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories, tags, posts, postTags } from '../drizzle/schema';

async function seedBlog() {
  try {
    console.log('🌱 Iniciando seed do blog...');

    const sql = postgres(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Verificar se já existem dados
    const existingPosts = await db.select().from(posts).limit(1);
    if (existingPosts.length > 0) {
      console.log('✅ Blog já possui dados. Pulando seed...');
      await sql.end();
      return;
    }

    console.log('📝 Criando categorias...');

    // Inserir categorias
    const categoriesData = [
      {
        name: 'Psicologia Clínica',
        slug: 'psicologia-clinica',
        description: 'Artigos sobre psicologia clínica, transtornos mentais e terapias'
      },
      {
        name: 'Saúde Mental',
        slug: 'saude-mental',
        description: 'Conteúdo sobre bem-estar mental, prevenção e autocuidado'
      },
      {
        name: 'Terapia Online',
        slug: 'terapia-online',
        description: 'Informações sobre terapia remota e seus benefícios'
      },
      {
        name: 'Ansiedade e Depressão',
        slug: 'ansiedade-depressao',
        description: 'Artigos sobre manejo de ansiedade e depressão'
      },
      {
        name: 'Relacionamentos',
        slug: 'relacionamentos',
        description: 'Dicas para relacionamentos saudáveis e resolução de conflitos'
      }
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoriesData)
      .returning();

    console.log(`✅ Criadas ${insertedCategories.length} categorias`);

    console.log('🏷️  Criando tags...');

    // Inserir tags
    const tagsData = [
      { name: 'Ansiedade', slug: 'ansiedade' },
      { name: 'Depressão', slug: 'depressao' },
      { name: 'Terapia', slug: 'terapia' },
      { name: 'Autocuidado', slug: 'autocuidado' },
      { name: 'Relacionamentos', slug: 'relacionamentos' },
      { name: 'Saúde Mental', slug: 'saude-mental' },
      { name: 'Psicologia', slug: 'psicologia' },
      { name: 'Bem-estar', slug: 'bem-estar' },
      { name: 'Terapia Online', slug: 'terapia-online' },
      { name: 'Prevenção', slug: 'prevencao' },
      { name: 'Estresse', slug: 'estresse' },
      { name: 'Autoestima', slug: 'autoestima' }
    ];

    const insertedTags = await db
      .insert(tags)
      .values(tagsData)
      .returning();

    console.log(`✅ Criadas ${insertedTags.length} tags`);

    console.log('📄 Criando posts...');

    // Inserir posts com conteúdo rico
    const postsData = [
      {
        title: 'Entendendo a Ansiedade: Sinais, Causas e Como Lidar',
        slug: 'entendendo-ansiedade-sinais-causas-como-lidar',
        excerpt: 'A ansiedade é uma resposta natural do corpo ao estresse, mas quando se torna excessiva, pode interferir na qualidade de vida. Aprenda a identificar os sinais e descobrir estratégias eficazes para lidar com ela.',
        content: `# Entendendo a Ansiedade: Sinais, Causas e Como Lidar

A ansiedade é uma emoção natural e necessária para a sobrevivência humana. Ela nos prepara para enfrentar situações desafiadoras e nos mantém alertas diante de perigos. No entanto, quando a ansiedade se torna crônica e excessiva, pode transformar-se em um transtorno que interfere significativamente na qualidade de vida.

## O que é Ansiedade?

A ansiedade é caracterizada por sentimentos de preocupação, nervosismo e medo intensos sobre situações futuras. Diferentemente do medo, que é uma resposta a uma ameaça real e imediata, a ansiedade envolve antecipação de problemas que podem ou não acontecer.

### Sinais Comuns de Ansiedade

- Preocupação excessiva e persistente
- Sensação de inquietude ou agitação
- Dificuldade para se concentrar
- Irritabilidade
- Distúrbios do sono
- Tensão muscular
- Sudorese excessiva
- Taquicardia

## Causas da Ansiedade

A ansiedade pode ser desencadeada por diversos fatores:

### Fatores Biológicos
- Desequilíbrios químicos no cérebro
- Predisposição genética
- Alterações hormonais

### Fatores Ambientais
- Estresse crônico no trabalho
- Problemas financeiros
- Conflitos relacionais
- Eventos traumáticos

### Fatores de Estilo de Vida
- Falta de exercício físico
- Alimentação inadequada
- Uso excessivo de cafeína ou álcool
- Má qualidade do sono

## Estratégias para Lidar com a Ansiedade

### Técnicas de Relaxamento
- Respiração profunda (técnica 4-7-8)
- Meditação mindfulness
- Yoga e alongamentos
- Massagem terapêutica

### Mudanças no Estilo de Vida
- Prática regular de exercícios físicos
- Alimentação balanceada e rica em nutrientes
- Estabelecimento de rotina de sono saudável
- Limitação do consumo de cafeína e álcool

### Apoio Profissional
Quando a ansiedade interfere significativamente nas atividades diárias, é fundamental buscar ajuda profissional. A terapia cognitivo-comportamental (TCC) tem se mostrado muito eficaz no tratamento da ansiedade.

## Quando Procurar Ajuda

Considere buscar ajuda profissional se:
- A ansiedade interfere no seu trabalho ou estudos
- Você evita situações sociais por medo
- Apresenta sintomas físicos intensos
- Sente que não consegue controlar a preocupação

Lembre-se: buscar ajuda é um sinal de força, não de fraqueza. A ansiedade é tratável e milhões de pessoas levam vidas plenas após o tratamento adequado.`,
        coverImage: '/images/blog/ansiedade-capa.jpg',
        categoryId: insertedCategories.find(c => c.slug === 'ansiedade-depressao')?.id,
        publishedAt: new Date('2024-01-15'),
        views: 245
      },
      {
        title: 'A Importância da Terapia Online na Saúde Mental Moderna',
        slug: 'importancia-terapia-online-saude-mental-moderna',
        excerpt: 'A terapia online revolucionou o acesso aos cuidados de saúde mental. Descubra as vantagens da telepsicologia e como ela pode transformar o tratamento de transtornos mentais.',
        content: `# A Importância da Terapia Online na Saúde Mental Moderna

A pandemia de COVID-19 acelerou a adoção da terapia online, mas seus benefícios vão muito além da conveniência durante períodos de isolamento. A telepsicologia, ou terapia online, representa uma revolução no acesso aos cuidados de saúde mental.

## O que é Terapia Online?

A terapia online, também conhecida como telepsicologia ou e-terapia, consiste na prestação de serviços psicológicos por meio de plataformas digitais. As sessões podem ser realizadas por vídeo, chat, email ou telefone, mantendo a mesma qualidade e eficácia da terapia presencial.

## Vantagens da Terapia Online

### Acesso Universal
A terapia online quebra barreiras geográficas e de mobilidade. Pessoas que vivem em áreas remotas, com dificuldade de locomoção ou que enfrentam longos deslocamentos agora podem acessar cuidados psicológicos de qualidade.

### Flexibilidade de Horários
As sessões online permitem maior flexibilidade no agendamento, facilitando a conciliação com trabalho, estudos e outras responsabilidades diárias.

### Redução da Estigma
Muitos pacientes se sentem mais confortáveis ao iniciar a terapia em casa, longe do ambiente clínico tradicional, o que pode reduzir o estigma associado aos cuidados de saúde mental.

### Continuidade do Tratamento
A terapia online garante que o tratamento continue mesmo durante viagens, mudanças de cidade ou situações de emergência.

## Efetividade da Terapia Online

Diversos estudos científicos comprovam que a terapia online é tão eficaz quanto a presencial para o tratamento de diversos transtornos mentais, incluindo:

- Depressão
- Ansiedade
- Transtorno do Pânico
- Transtorno Obsessivo-Compulsivo (TOC)
- Estresse Pós-Traumático (TEPT)

## Como Funciona uma Sessão Online

### Preparação
- Escolha uma plataforma segura e confidencial
- Garanta uma conexão estável de internet
- Encontre um local privado e tranquilo
- Teste os equipamentos com antecedência

### Durante a Sessão
- Mantenha o foco e a concentração
- Expresse-se com naturalidade
- Faça anotações se necessário
- Esteja preparado para compartilhar sua tela se solicitado

### Após a Sessão
- Reflita sobre os insights obtidos
- Pratique as técnicas aprendidas
- Agende a próxima sessão conforme orientado

## Considerações Éticas e Legais

A terapia online segue os mesmos princípios éticos da terapia presencial:
- Confidencialidade e privacidade dos dados
- Sigilo profissional
- Consentimento informado
- Competência técnica do profissional

## O Futuro da Saúde Mental

A terapia online representa o futuro dos cuidados de saúde mental. Com o avanço da tecnologia e a crescente demanda por serviços acessíveis, a telepsicologia continuará a evoluir, incorporando ferramentas como realidade virtual, inteligência artificial e monitoramento contínuo.

Investir na terapia online significa investir na saúde mental de toda a população, tornando os cuidados psicológicos mais acessíveis, eficientes e humanizados.`,
        coverImage: '/images/blog/terapia-online-capa.jpg',
        categoryId: insertedCategories.find(c => c.slug === 'terapia-online')?.id,
        publishedAt: new Date('2024-01-20'),
        views: 189
      },
      {
        title: 'Como Fortalecer a Autoestima e a Confiança Pessoal',
        slug: 'como-fortalecer-autoestima-confianca-pessoal',
        excerpt: 'A autoestima é fundamental para uma vida plena e saudável. Aprenda técnicas práticas para desenvolver uma imagem positiva de si mesmo e construir confiança duradoura.',
        content: `# Como Fortalecer a Autoestima e a Confiança Pessoal

A autoestima é como um músculo: quanto mais você a exercita, mais forte ela fica. Desenvolver uma autoestima saudável é fundamental para viver com plenitude, enfrentar desafios e construir relacionamentos satisfatórios.

## O que é Autoestima?

Autoestima é a avaliação que fazemos de nós mesmos, incluindo nossos valores, capacidades e limitações. Uma autoestima saudável nos permite:

- Aceitar nossas qualidades e defeitos
- Estabelecer limites saudáveis
- Buscar crescimento pessoal
- Manter relacionamentos equilibrados
- Enfrentar fracassos como oportunidades de aprendizado

## Sinais de Baixa Autoestima

- Autocrítica excessiva
- Dificuldade em aceitar elogios
- Medo de tentar coisas novas
- Dependência da aprovação dos outros
- Comparação constante com os demais
- Evitação de conflitos ou confrontos

## Estratégias para Fortalecer a Autoestima

### 1. Pratique a Autocompaixão
Trate-se com a mesma gentileza que trataria um amigo querido. Quando cometer erros, pergunte-se: "Eu diria isso para alguém que amo?"

### 2. Celebre suas Conquistas
Mantenha um diário de gratidão focado em suas realizações, por menores que sejam. Reconhecer o progresso fortalece a confiança.

### 3. Estabeleça Metas Realistas
Divida grandes objetivos em passos pequenos e alcançáveis. Cada conquista reforça sua crença em suas capacidades.

### 4. Cuide do seu Corpo
A atividade física regular, uma alimentação saudável e o descanso adequado têm impacto direto na percepção que temos de nós mesmos.

### 5. Aprenda com os Erros
Veja os fracassos como oportunidades de aprendizado, não como definições do seu valor como pessoa.

## Exercícios Práticos

### Diário de Afirmações Positivas
Escreva diariamente três qualidades suas e uma ação concreta que demonstre essas qualidades.

### Visualização Guiada
Dedique 5 minutos diários para visualizar-se alcançando seus objetivos, sentindo a confiança e satisfação associadas.

### Lista de Forças
Faça uma lista de suas habilidades, conquistas e qualidades. Leia-a quando precisar de um lembrete.

## O Papel da Terapia

Quando a baixa autoestima está profundamente enraizada, a ajuda profissional pode ser fundamental. A terapia oferece ferramentas específicas para:

- Identificar padrões de pensamento negativos
- Desenvolver habilidades de comunicação assertiva
- Processar experiências traumáticas
- Construir uma narrativa pessoal mais positiva

## Autoestima vs. Arrogância

É importante distinguir autoestima saudável de arrogância. A primeira reconhece o valor próprio sem desvalorizar os outros, enquanto a segunda envolve superioridade e desrespeito.

## Resultados a Longo Prazo

Desenvolver autoestima é um processo contínuo que traz benefícios duradouros:

- Maior resiliência emocional
- Relacionamentos mais saudáveis
- Melhor desempenho profissional
- Maior satisfação com a vida
- Capacidade de perseguir sonhos com confiança

Lembre-se: você é único e valioso exatamente como é. A jornada para uma autoestima saudável começa com um único passo de gentileza consigo mesmo.`,
        coverImage: '/images/blog/autoestima-capa.jpg',
        categoryId: insertedCategories.find(c => c.slug === 'saude-mental')?.id,
        publishedAt: new Date('2024-01-25'),
        views: 156
      },
      {
        title: 'Relacionamentos Saudáveis: Como Construir Conexões Duradouras',
        slug: 'relacionamentos-saudaveis-construir-conexoes-duradouras',
        excerpt: 'Relacionamentos saudáveis são fundamentais para o bem-estar emocional. Descubra os pilares de conexões duradouras e como cultivá-las em sua vida.',
        content: `# Relacionamentos Saudáveis: Como Construir Conexões Duradouras

Relacionamentos saudáveis são essenciais para nossa saúde mental e emocional. Eles nos proporcionam suporte, alegria e um senso de pertencimento. Construir conexões duradouras requer investimento consciente e habilidades específicas.

## Os Pilares dos Relacionamentos Saudáveis

### Comunicação Aberta e Honesta
A base de qualquer relacionamento saudável é a comunicação clara e respeitosa. Isso inclui:

- Expressar sentimentos e necessidades de forma assertiva
- Ouvir ativamente sem interromper
- Evitar acusações e focar em soluções
- Praticar a empatia e validação dos sentimentos do outro

### Confiança Mútua
A confiança é construída ao longo do tempo através de:

- Cumprimento de promessas e compromissos
- Respeito à privacidade
- Transparência adequada
- Consistência nas ações e palavras

### Respeito às Individualidades
Cada pessoa é única e deve ser respeitada por sua individualidade:

- Aceitar diferenças de opinião e valores
- Apoiar os objetivos pessoais do outro
- Manter espaço para crescimento individual
- Celebrar as conquistas mútuas

### Resolução de Conflitos
Conflitos são naturais, mas a forma como os resolvemos determina a saúde do relacionamento:

- Abordar problemas quando estão pequenos
- Usar "eu" ao invés de "você" nas discussões
- Buscar soluções win-win
- Estar disposto a ceder quando necessário

## Tipos de Relacionamentos

### Relacionamentos Românticos
Envolvem intimidade emocional e física. Requerem:
- Compatibilidade de valores
- Atratividade mútua
- Compromisso compartilhado
- Comunicação frequente sobre necessidades

### Relacionamentos de Amizade
Baseados em interesses compartilhados e apoio mútuo:
- Lealdade e confiabilidade
- Apoio emocional
- Compartilhamento de experiências
- Respeito aos limites

### Relacionamentos Familiares
Os mais complexos devido aos laços sanguíneos:
- Aceitação incondicional
- Perdão e reconciliação
- Manutenção de fronteiras saudáveis
- Comunicação clara sobre expectativas

### Relacionamentos Profissionais
Focados em colaboração e respeito mútuo:
- Profissionalismo
- Comunicação clara
- Reconhecimento de contribuições
- Manutenção de limites pessoais

## Sinais de Relacionamentos Não Saudáveis

### Sinais de Alerta
- Falta de respeito pelas opiniões do outro
- Controle excessivo ou ciúmes
- Manipulação emocional
- Isolamento social
- Violência verbal ou física

### Quando Buscar Ajuda
- Quando os conflitos se tornam frequentes e intensos
- Quando há perda de confiança
- Quando um dos parceiros apresenta mudanças comportamentais significativas
- Quando há sinais de abuso

## Como Melhorar Relacionamentos Existentes

### Comunicação Diária
- Dedique tempo de qualidade sem distrações
- Pratique a escuta ativa
- Expresse gratidão diariamente
- Compartilhe experiências positivas

### Desenvolvimento Conjunto
- Estabeleçam metas compartilhadas
- Aprendam juntos novas habilidades
- Viajem e criem memórias
- Celebrem aniversários e datas especiais

### Manutenção da Intimidade
- Mantenham contato físico positivo
- Compartilhem vulnerabilidades
- Pratiquem atividades que fortaleçam o vínculo
- Renovam votos e compromissos periodicamente

## O Papel da Terapia de Casal

A terapia de casal pode ser benéfica quando:
- Há padrões de conflito recorrentes
- A comunicação se tornou difícil
- Há infidelidade ou traição
- Um dos parceiros enfrenta problemas individuais que afetam o relacionamento

## Investimento em Relacionamentos

Relacionamentos saudáveis requerem investimento contínuo:

- Tempo dedicado
- Energia emocional
- Compromisso com o crescimento mútuo
- Paciência durante momentos difíceis
- Celebração das conquistas compartilhadas

Lembre-se: relacionamentos saudáveis nos tornam melhores versões de nós mesmos e contribuem significativamente para nossa felicidade e bem-estar geral.`,
        coverImage: '/images/blog/relacionamentos-capa.jpg',
        categoryId: insertedCategories.find(c => c.slug === 'relacionamentos')?.id,
        publishedAt: new Date('2024-02-01'),
        views: 203
      },
      {
        title: 'Gerenciando o Estresse no Cotidiano Moderno',
        slug: 'gerenciando-estresse-cotidiano-moderno',
        excerpt: 'O estresse é inevitável na vida moderna, mas pode ser gerenciado. Aprenda técnicas eficazes para reduzir o estresse e melhorar sua qualidade de vida.',
        content: `# Gerenciando o Estresse no Cotidiano Moderno

Vivemos em uma era de constante conectividade e demandas crescentes. O estresse tornou-se uma companheira inevitável da vida moderna, mas aprender a gerenciá-lo pode fazer a diferença entre sobreviver e prosperar.

## O que é Estresse?

O estresse é a resposta natural do organismo a situações desafiadoras ou ameaçadoras. Em pequenas doses, o estresse é benéfico - nos mantém alertas e motivados. O problema surge quando se torna crônico.

### Tipos de Estresse

**Estresse Agudo**: Resposta imediata a uma situação específica
- Exame importante
- Apresentação de trabalho
- Situação de emergência

**Estresse Crônico**: Persistente ao longo do tempo
- Pressão no trabalho
- Problemas financeiros
- Conflitos relacionais

## Impactos do Estresse Crônico

### Físicos
- Dores de cabeça frequentes
- Problemas digestivos
- Distúrbios do sono
- Sistema imunológico enfraquecido
- Aumento do risco cardiovascular

### Emocionais
- Irritabilidade
- Ansiedade
- Depressão
- Diminuição da concentração
- Perda de interesse em atividades prazerosas

### Comportamentais
- Isolamento social
- Aumento no consumo de álcool ou cafeína
- Procrastinação
- Mudanças nos hábitos alimentares

## Estratégias de Gerenciamento do Estresse

### Técnicas de Relaxamento

**Respiração Profunda**
- Técnica 4-7-8: Inspire por 4 segundos, segure por 7, expire por 8
- Respiração abdominal: Foque na expansão do diafragma
- Respiração alternada: Alterna narinas para equilibrar energia

**Meditação e Mindfulness**
- Meditação guiada diária (10-15 minutos)
- Prática de atenção plena nas atividades cotidianas
- Aplicativos como Headspace ou Calm

### Organização e Planejamento

**Gestão do Tempo**
- Técnica Pomodoro: 25 minutos de foco + 5 minutos de pausa
- Priorização de tarefas (matriz Eisenhower)
- Delegação de responsabilidades

**Rotina Estruturada**
- Horários regulares para refeições e sono
- Planejamento semanal de atividades
- Estabelecimento de limites de trabalho

### Cuidados com o Corpo

**Atividade Física Regular**
- Exercícios aeróbicos (caminhada, corrida, natação)
- Alongamentos e yoga
- Atividades prazerosas ao ar livre

**Alimentação Saudável**
- Refeições balanceadas com nutrientes antiestresse
- Hidratação adequada
- Limitação de cafeína e açúcar refinado

**Sono de Qualidade**
- Ambiente propício ao descanso
- Rotina de relaxamento antes de dormir
- Evitar telas 1 hora antes de deitar

### Apoio Social

**Rede de Apoio**
- Conversas com amigos e familiares
- Participação em grupos de apoio
- Atividades em comunidade

**Limites Saudáveis**
- Aprender a dizer "não"
- Estabelecer fronteiras no trabalho
- Proteger tempo pessoal

## Quando Buscar Ajuda Profissional

### Sinais de Alerta
- Estresse que interfere no trabalho ou relacionamentos
- Sintomas físicos persistentes
- Pensamentos suicidas ou de autoagressão
- Uso de substâncias para lidar com o estresse

### Opções de Tratamento
- Terapia cognitivo-comportual
- Técnicas de relaxamento profissional
- Medicamentos quando necessário
- Grupos de apoio especializados

## Prevenção do Estresse

### Hábitos Preventivos
- Manutenção de equilíbrio trabalho-vida pessoal
- Desenvolvimento de hobbies e interesses
- Prática de gratidão diária
- Aprendizado contínuo e crescimento pessoal

### Ambiente de Trabalho
- Comunicação aberta com superiores
- Organização do espaço de trabalho
- Pausas regulares durante o expediente
- Desenvolvimento de habilidades de gerenciamento

## O Papel da Resiliência

A resiliência é a capacidade de se recuperar do estresse. Pode ser desenvolvida através de:

- Aprendizado com experiências passadas
- Desenvolvimento de coping skills
- Manutenção de perspectiva otimista
- Construção de rede de apoio forte

Lembre-se: o estresse é inevitável, mas como respondemos a ele está sob nosso controle. Pequenas mudanças diárias podem levar a transformações significativas na qualidade de vida.`,
        coverImage: '/images/blog/estresse-capa.jpg',
        categoryId: insertedCategories.find(c => c.slug === 'saude-mental')?.id,
        publishedAt: new Date('2024-02-05'),
        views: 178
      }
    ];

    const insertedPosts = await db
      .insert(posts)
      .values(postsData)
      .returning();

    console.log(`✅ Criados ${insertedPosts.length} posts`);

    console.log('🔗 Associando tags aos posts...');

    // Associar tags aos posts
    const postTagAssociations = [
      // Post 1: Ansiedade
      { postId: insertedPosts[0].id, tagSlug: 'ansiedade' },
      { postId: insertedPosts[0].id, tagSlug: 'saude-mental' },
      { postId: insertedPosts[0].id, tagSlug: 'terapia' },

      // Post 2: Terapia Online
      { postId: insertedPosts[1].id, tagSlug: 'terapia-online' },
      { postId: insertedPosts[1].id, tagSlug: 'psicologia' },
      { postId: insertedPosts[1].id, tagSlug: 'bem-estar' },

      // Post 3: Autoestima
      { postId: insertedPosts[2].id, tagSlug: 'autoestima' },
      { postId: insertedPosts[2].id, tagSlug: 'autocuidado' },
      { postId: insertedPosts[2].id, tagSlug: 'saude-mental' },

      // Post 4: Relacionamentos
      { postId: insertedPosts[3].id, tagSlug: 'relacionamentos' },
      { postId: insertedPosts[3].id, tagSlug: 'bem-estar' },
      { postId: insertedPosts[3].id, tagSlug: 'psicologia' },

      // Post 5: Estresse
      { postId: insertedPosts[4].id, tagSlug: 'estresse' },
      { postId: insertedPosts[4].id, tagSlug: 'autocuidado' },
      { postId: insertedPosts[4].id, tagSlug: 'saude-mental' }
    ];

    // Converter slugs para IDs
    const postTagValues = postTagAssociations.map(assoc => ({
      postId: assoc.postId,
      tagId: insertedTags.find(tag => tag.slug === assoc.tagSlug)!.id
    }));

    await db.insert(postTags).values(postTagValues);

    console.log(`✅ Associadas tags aos posts`);

    console.log('🎉 Seed do blog concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - ${insertedCategories.length} categorias`);
    console.log(`   - ${insertedTags.length} tags`);
    console.log(`   - ${insertedPosts.length} posts`);
    console.log(`   - ${postTagValues.length} associações post-tag`);

    await sql.end();
  } catch (error) {
    console.error('❌ Erro ao fazer seed do blog:', error);
    process.exit(1);
  }
}

seedBlog();