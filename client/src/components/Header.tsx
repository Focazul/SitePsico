import { useEffect, useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuickBooking } from '@/contexts/QuickBookingContext';

/**
 * Header Component
 * Design: Minimalismo Humanista
 * - Navegação simples e intuitiva
 * - Logo/nome profissional em destaque
 * - Menu responsivo com transições suaves
 */

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { openModal } = useQuickBooking();

  const navItems = useMemo(() => ([
    { label: 'Home', href: '/' },
    { label: 'Sobre', href: '/sobre' },
    {
      label: 'Serviços',
      href: '/servicos',
      dropdown: [
        { title: 'Visão geral', href: '/servicos' },
        { title: 'Modalidades', href: '/servicos#modalidades' },
        { title: 'Áreas de atuação', href: '/servicos#areas' },
        { title: 'Valores e duração', href: '/servicos#valores' },
      ],
    },
    {
      label: 'Conteúdo',
      href: '/blog',
      dropdown: [
        { title: 'Blog', href: '/blog' },
        { title: 'Artigos recentes', href: '/blog#recentes' },
        { title: 'Categorias', href: '/blog#categorias' },
      ],
    },
    { label: 'Agendamento', href: '/agendamento' },
    { label: 'Contato', href: '/contato' },
  ]), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location === href || location.startsWith(href + '/') || location.startsWith(href + '#') || (href === '/blog' && location.startsWith('/blog'));
  };

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-50 transition-[background,box-shadow,border] duration-300 backdrop-blur-md border-b',
        isScrolled ? 'bg-background/90 border-border/70 shadow-sm' : 'bg-transparent border-transparent'
      )}
    >
      <nav 
        role="navigation"
        aria-label="Menu principal"
        className="container flex items-center justify-between py-4 md:py-5"
      >
        {/* Logo/Nome */}
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <img
            src="/images/logo-main.png"
            alt="Logo"
            className="w-11 h-11 md:w-12 md:h-12 object-contain"
          />
          <div className="hidden sm:block text-left">
            <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">Psicologia</p>
            <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
              [Nome do Psicólogo]
            </h1>
            <p className="text-xs text-muted-foreground">CRP 06/[Número]</p>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu viewport={false} className="flex-1 justify-end">
            <NavigationMenuList className="gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.dropdown ? (
                    <NavigationMenuTrigger className={cn(isActive(item.href) && 'bg-accent/30 text-accent-foreground')}>{item.label}</NavigationMenuTrigger>
                  ) : (
                    <NavigationMenuLink
                      href={item.href}
                      data-active={isActive(item.href)}
                      className={cn('px-3 py-2 font-medium', isActive(item.href) && 'bg-accent/30 text-accent-foreground')}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.href);
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  )}

                  {item.dropdown && (
                    <NavigationMenuContent className="md:min-w-[320px] bg-background border-border/60">
                      <div className="grid gap-2 p-3">
                        {item.dropdown.map((sub) => (
                          <NavigationMenuLink
                            key={sub.title}
                            href={sub.href}
                            data-active={isActive(sub.href)}
                            className="font-medium"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(sub.href);
                            }}
                          >
                            {sub.title}
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  )}
                  <NavigationMenuIndicator />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 shadow-md shadow-accent/30"
            onClick={() => openModal()}
          >
            Agendar Consulta
          </Button>
        </div>

        {/* Menu Mobile */}
        <button
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Menu Mobile Expandido */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-foreground hover:text-accent transition-colors py-3 font-medium rounded-md px-1',
                  isActive(item.href) && 'text-accent'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => {
                setIsMenuOpen(false);
                openModal();
              }}
            >
              Agendar Consulta
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
