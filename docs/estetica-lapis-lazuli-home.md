# Estética Lápis-Lázuli - Home Page

Este documento descreve o design alternativo "Lápis-Lázuli" para a página inicial, baseado no arquivo `estetica_lapis-lazuli.html`. Serve como referência para comparação com o design atual e direcionamento de mudanças.

## Paleta de Cores

### Cores Principais
- **Azul Profundo** (#1B3A7A): Cor primária - azul místico inspirado no lápis-lázuli puro
- **Azul Secundário** (#2E5EA8): Azul mais luminoso para elementos destacados
- **Ouro Sofisticado** (#c9a961): Accent color - ouro que contrasta com o azul
- **Azul Claro** (#E8F0FF): Fundo claro para surfaces
- **Azul Escuro** (#0F1F3D): Texto e elementos escuros

### Cores de Texto
- **Texto Primário**: Azul profundo (#1B3A7A)
- **Texto Secundário**: Azul médio (#2E5EA8)
- **Texto Accent**: Ouro (#c9a961)
- **Texto Corpo**: Cinza azulado (#5A6B7F)

## Layout e Estrutura

### Header
- **Fundo**: Gradiente sutil do background com transparência
- **Borda**: Linha inferior com mistura de accent e branco
- **Logo**: Marca circular com gradiente azul-ouro
- **Navegação**: Links em azul escuro, fonte semibold
- **Botão CTA**: Gradiente azul, bordas arredondadas

### Seções
- **Padding**: 50px vertical, 10px horizontal
- **Seções Suaves**: Fundo com 8% de accent misturado ao branco
- **Border Radius**: 16px para seções e elementos

## Hero Section

### Layout
- **Grid**: 2 colunas responsivas (min 260px)
- **Gap**: 28px entre elementos
- **Alinhamento**: Items centralizados verticalmente

### Conteúdo Esquerdo
- **Badge**: "Bem-vindo(a)" em maiúsculo, accent color, letter-spacing
- **Título**: H1 em azul profundo
- **Subtítulo**: Texto em cinza azulado
- **Botões**: CTA principal em gradiente azul, secundário outline
- **Trust Indicators**: Lista horizontal de garantias em cinza

### Conteúdo Direito
- **Card Hero**: Gradiente azul com formas decorativas
- **Elemento Decorativo**: Círculo semi-transparente em ouro no canto superior direito

## Seções de Conteúdo

### Sobre Mim
- **Fundo**: Seção soft (azul claro suave)
- **Título**: H2 em azul profundo
- **Subtítulo**: Texto menor em cinza
- **Grid**: 3 colunas responsivas (min 220px)
- **Cards**: Branco, border radius, sombra pequena, borda sutil com accent

### Valores e Princípios
- **Fundo**: Normal (branco)
- **Grid**: Mesmo layout do Sobre
- **Cards**: Texto simples, sem ícones específicos

### Áreas de Atuação
- **Fundo**: Soft novamente
- **Tags**: Badges circulares em azul claro, texto azul profundo
- **Layout**: Flex wrap, gap pequeno, centralizado

### Agendamento
- **Fundo**: Normal
- **Formulário**: Card branco com grid interno
- **Inputs**: Campos com border radius
- **Botão**: Gradiente azul

### Contato
- **Fundo**: Soft
- **Grid**: 3 colunas
- **Cards**: Simples, texto de contato

## Elementos Visuais Comuns

### Cards
- **Background**: Branco (#fff)
- **Border Radius**: var(--radius) = 18px
- **Shadow**: var(--shadow-sm)
- **Border**: 1px sólido com mistura de accent

### Botões
- **Primário**: Gradiente 135deg azul profundo → azul secundário
- **Secundário**: Outline, hover com background muted
- **Lápis-Lázuli**: Azul com borda dourada (gradiente azul, borda ouro)
- **Filtro Selecionado**: Borda dourada + fundo azul (para filtros/seleções)
- **Border Radius**: 999px (circular)
- **Shadow**: Pequena
- **Hover**: translateY(-2px)

### Sombras
- **sm**: 0 10px 24px -18px rgba(15, 23, 42, 0.35)
- **md**: 0 18px 42px -26px rgba(15, 23, 42, 0.45)
- **lg**: 0 28px 60px -40px rgba(15, 23, 42, 0.65)

## Gradientes

### Gradientes Harmoniosos
1. **Primário → Secundário**: Azul profundo para azul médio
2. **Secundário → Ouro**: Azul médio para dourado
3. **Escuro → Profundo**: Azul escuro para azul profundo
4. **Claro → Ouro**: Azul claro para dourado

## Responsividade

### Breakpoints
- **Mobile**: Grid single column
- **Desktop**: Multi-column grids

### Ajustes Mobile
- Headers menores
- Buttons full width
- Reduced padding

## Comparação com Design Atual

### Diferenças Principais
- **Cores**: Azul dominante vs Verde menta atual
- **Accent**: Ouro vs Verde menta
- **Background**: Azul muito claro vs Branco/cinza
- **Contraste**: Azul escuro vs Cinza escuro
- **Luxo**: Mais sofisticado e "pedra preciosa"

### Elementos Mantidos
- Estrutura de seções
- Tipografia hierárquica
- Layout responsivo
- Componentes básicos (cards, buttons)

### Possíveis Mudanças para Implementar
1. ✅ **Botão CTA modificado**: Azul com borda dourada (Home.tsx linha ~364)
2. ✅ **Botão Serviços modificado**: Azul com borda dourada (Services.tsx linha ~125)
3. ✅ **Botão Sobre modificado**: Azul com borda dourada (About.tsx linha ~98)
4. ✅ **Botão Blog modificado**: Azul com borda dourada (Blog.tsx linha ~431)
5. ✅ **Botão BlogPost modificado**: Azul com borda dourada (BlogPost.tsx linha ~166)
6. ✅ **Botão Formulário modificado**: Azul com borda dourada (AppointmentForm.tsx linha ~268)
7. ✅ **Filtros Blog modificados**: Borda dourada + fundo azul quando selecionado (Blog.tsx)
8. ✅ **Seleção horário modificada**: Borda dourada + fundo azul (Booking.tsx)
9. Atualizar CSS variables para nova paleta
10. Modificar gradientes nos botões e hero
11. Ajustar cores de texto e backgrounds
12. Implementar novos elementos decorativos (círculos, formas)
13. Ajustar sombras para o novo esquema

## Notas de Implementação

- Usar `color-mix()` para misturas sutis
- Manter acessibilidade (contraste adequado)
- Testar combinações em diferentes dispositivos
- Considerar impacto na identidade visual</content>
<parameter name="filePath">c:\Users\marce\Music\projeto site\teste 1 (Psico)\docs\estetica-lapis-lazuli-home.md