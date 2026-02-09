# Inventário de Elementos Visuais - Site Psicólogo

Este documento serve como glossário para facilitar a comunicação sobre os elementos visuais do projeto. Cada elemento é descrito com seu nome técnico, localização típica e função visual.

## Layout e Estrutura

### Header
- **Descrição**: Barra de navegação superior com logo, menu e botões de ação
- **Localização**: Topo de todas as páginas
- **Elementos**: Logo, links de navegação, botão CTA (Call to Action)

### Footer
- **Descrição**: Rodapé com informações de contato, links e copyright
- **Localização**: Base de todas as páginas
- **Elementos**: Links de contato, redes sociais, informações legais

### OrganicDivider
- **Descrição**: Divisor orgânico com formas curvas entre seções
- **Localização**: Entre seções principais
- **Variações**: Cores (accent, secondary, primary)

## Componentes de Conteúdo

### Hero Section
- **Descrição**: Seção principal de destaque na home
- **Elementos**: Título principal, subtítulo, botões CTA, imagem hero, orbes decorativos
- **Classes CSS**: `hero-shell`, `hero-media-frame`, `hero-media-image`, `hero-orb`
- **Estilo Lápis-Lázuli**: Moldura com gradiente azul + dourado, borda dupla, filtros suaves na imagem

### Card
- **Descrição**: Container retangular para conteúdo agrupado
- **Variações**: Com sombra, borda, hover effects
- **Uso**: Informações, formulários, destaques

### Button
- **Descrição**: Botões interativos
- **Variações**: Primary, secondary, outline, gradient
- **Classes**: `btn-gradient`, `btn-secondary`, `btn-lapis-lazuli`, `btn-outline-blue`, `btn-filter-selected`
- **btn-lapis-lazuli**: Azul com borda dourada (gradiente azul, borda ouro)
- **btn-outline-blue**: Branco com borda azul (harmonia com fundo azul)
- **btn-filter-selected**: Borda dourada + fundo azul (para filtros/seleções)
- **Aplicado em**: Botões CTA principais (Home, Services, About, Blog, BlogPost) + Filtros admin

### Badge
- **Descrição**: Etiquetas pequenas para status ou categorias
- **Variações**: Outline, filled, com ícones

### ImageGallery
- **Descrição**: Galeria de imagens com layout grid
- **Elementos**: Imagens com captions, layout responsivo
- **Estilo Lápis-Lázuli**: Borda dourada, fundo em gradiente azul, overlay temático e filtros suaves

## Componentes Específicos

### ProfilePhoto
- **Descrição**: Foto profissional do psicólogo
- **Tamanhos**: xl, lg, md
- **Uso**: Seções "Sobre Mim"
- **Estilo Lápis-Lázuli**: Borda dourada reforçada, overlay temático e gradiente no fundo

### AppointmentForm
- **Descrição**: Formulário de agendamento de consulta
- **Elementos**: Campos de input, select, textarea, botão submit

### FAQSection
- **Descrição**: Seção de perguntas frequentes
- **Elementos**: Accordions expansíveis

### ValuesSection
- **Descrição**: Seção de valores e princípios
- **Layout**: Grid de cards com ícones

### BackToTop
- **Descrição**: Botão flutuante para voltar ao topo
- **Comportamento**: Aparece ao scroll, animação suave

## Elementos de UI Básicos

### FadeIn
- **Descrição**: Animação de entrada com fade
- **Uso**: Revelação gradual de conteúdo

### useScrollReveal
- **Descrição**: Hook para animações ao scroll
- **Efeitos**: Opacity e translate transforms

### DashboardLayout
- **Descrição**: Layout para páginas admin
- **Elementos**: Sidebar, header admin, breadcrumbs

### AdminBreadcrumb
- **Descrição**: Navegação hierárquica em admin
- **Uso**: Indicar localização atual

## Ícones (Lucide)

### Navegação e Ações
- ArrowRight: Setas para direções
- Heart: Acolhimento, empatia
- Shield: Segurança, sigilo
- BookOpen: Conteúdo, conhecimento
- MessageCircle: Comunicação
- Calendar: Agendamentos
- CheckCircle: Confirmação, status positivo

### Formulários e Status
- Lock: Segurança, login
- Mail: Contato por email
- Eye: Visibilidade (senhas)
- Edit: Edição
- Trash: Exclusão
- Plus: Adicionar

## Cores e Temas (CSS Variables)

### Paleta Lápis-Lázuli (Atual)
- --primary: Azul profundo (base)
- --secondary: Azul médio (apoio)
- --accent: Dourado (contraste e destaque)
- --background: Branco/cinza claro
- --foreground: Texto principal
- --muted: Texto secundário

### Sombras
- --shadow-sm: Sombra pequena
- --shadow-md: Sombra média
- --shadow-lg: Sombra grande

## Layout Responsivo

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Grid Classes
- grid-cols-1/2/3: Colunas em grid
- gap-4/6/8: Espaçamentos

### Grid System Detalhado

#### Grid Básico (CSS Grid)
- **Classe**: `grid`
- **Uso**: Container principal para layouts em grid
- **Variações**:
  - `grid-cols-1`: 1 coluna (mobile)
  - `grid-cols-2`: 2 colunas (tablet/desktop)
  - `grid-cols-3`: 3 colunas (desktop)
  - `grid-cols-4`: 4 colunas (wide screens)

#### Grid Responsivo
- **Padrão**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Exemplos de Uso**:
  - Hero Section: `grid-cols-1 md:grid-cols-2` (lado a lado em desktop)
  - Cards de Serviços: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Valores: `grid-cols-1 md:grid-cols-3`
  - Áreas de Atuação: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

#### Gaps (Espaçamentos)
- **gap-4**: 16px (pequeno)
- **gap-6**: 24px (médio)
- **gap-8**: 32px (grande)
- **gap-12**: 48px (extra grande)

#### Grid Areas Específicas

##### Hero Section Grid
```css
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))
gap: 28px
align-items: center
```

##### Cards Grid
```css
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))
gap: 16px
```

##### Formulário Grid
```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
gap: 12px
```

#### Flexbox Grids (Alternativo)
- **Classe**: `flex flex-wrap`
- **Uso**: Para layouts mais flexíveis
- **Variações**:
  - `justify-center`: Centralizar horizontalmente
  - `justify-between`: Espaçar igualmente
  - `items-center`: Centralizar verticalmente

#### Grid de Tags/Badges
- **Layout**: `flex flex-wrap gap-3 justify-center`
- **Uso**: Áreas de atuação, filtros
- **Responsivo**: Quebra linha automaticamente

#### Grid de Imagens (ImageGallery)
- **Padrão**: 3 colunas em desktop, 1-2 em mobile
- **Classe**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Aspect Ratio**: Mantém proporção das imagens

#### Grid Admin
- **Dashboard**: `grid grid-cols-1 lg:grid-cols-4 gap-6`
- **Sidebar + Content**: `grid grid-cols-1 md:grid-cols-4`
- **Cards de Métricas**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

### Grid Utilities

#### Auto-fit vs Auto-fill
- **auto-fit**: Ajusta colunas para preencher espaço
- **auto-fill**: Cria colunas fixas, pode deixar vazio

#### Minmax
- **Padrão**: `minmax(220px, 1fr)` - mínimo 220px, cresce igualmente
- **Hero**: `minmax(260px, 1fr)` - mínimo 260px
- **Forms**: `minmax(200px, 1fr)` - mínimo 200px

#### Grid Template Areas
- **Uso**: Layouts complexos (raramente usado)
- **Exemplo**: Header com logo, nav, actions

### Responsividade por Componente

#### Mobile First
- Base: 1 coluna
- md: Adiciona 2 colunas
- lg: Adiciona 3+ colunas

#### Componentes que usam Grid
- **Hero Section**: 1 coluna → 2 colunas
- **Sobre Mim**: 1 coluna → 3 colunas (foto + bio)
- **Serviços**: 1 coluna → 2 colunas → 3 colunas
- **Valores**: 1 coluna → 3 colunas
- **FAQ**: 1 coluna (accordion)
- **Contato**: 1 coluna → 3 colunas
- **Blog Posts**: 1 coluna → 2 colunas → 3 colunas

#### Grid Nesting
- **Cards dentro de Grid**: Cards individuais podem ter grids internos
- **Form dentro de Card**: Grid para campos do formulário
- **Seções**: Grid principal contém sub-grids

## Animações e Transições

### Hover Effects
- transform: translateY(-2px)
- box-shadow: aumento
- opacity: mudanças

### Scroll Animations
- useScrollReveal: entrada ao scroll
- FadeIn: fade gradual

## Formulários

### Input Types
- text: Nome, email
- tel: Telefone
- select: Modalidade
- textarea: Observações

### Validation
- Estados: valid, invalid
- Mensagens de erro

## Gráficos (Admin)

### LineChart (Recharts)
- **Uso**: Tendências de agendamentos
- **Elementos**: Linhas, eixos, tooltips

## Imagens

### Hero Images
- hero-psychologist.jpg: Imagem principal
- wellness-blue.jpg: Ambiente bem-estar
- healing-journey.jpg: Jornada de cura

### Galeria
- trust-connection.jpg: Conexão terapêutica
- growth-journey.jpg: Crescimento pessoal
- wellbeing-abstract.jpg: Abstrato de bem-estar

### Tratamento Visual Lápis-Lázuli
- **Frame**: borda dourada e fundo em gradiente azul
- **Overlay**: gradiente azul/dourado sutil sobre a imagem
- **Filtros**: leve aumento de brilho e contraste no hover
- **Sombras**: sombra média para criar profundidade

## Tipografia

### Fontes
- Poppins: Títulos
- Lora: Corpo do texto

### Tamanhos
- text-4xl/5xl/6xl: Títulos grandes
- text-lg/xl: Subtítulos
- text-sm/base: Corpo

### Pesos
- font-bold: 700
- font-semibold: 600
- font-medium: 500</content>
<parameter name="filePath">c:\Users\marce\Music\projeto site\teste 1 (Psico)\docs\elementos-visuais.md