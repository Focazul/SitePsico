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
import { useSiteConfig } from '@/hooks/useSiteConfig';

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
  const { config } = useSiteConfig();

  const navItems = useMemo(() => ([
    { label: 'Home', href: '/' },
    { label: 'Sobre mim', href: '#sobre' },
    { label: 'Áreas de atuação', href: '#areas' },
    { label: 'Perguntas frequentes', href: '#faq' },
    { label: 'Blog', href: '/blog' },
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
        'sticky top-0 z-50 transition-[background,box-shadow,border] duration-300 border-b',
        isScrolled ? 'bg-background/90 border-accent/30 shadow-md' : 'bg-background/80 border-accent/20'
      )}
      style={{
        background: 'color-mix(in oklab, var(--background) 90%, #ffffff 10%)',
        borderBottomColor: 'color-mix(in oklab, var(--accent) 30%, #ffffff 70%)'
      }}
    >
      <nav 
        role="navigation"
        aria-label="Menu principal"
        className="container flex items-center justify-between py-4 md:py-5"
      >
        {/* Logo/Nome */}
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] shadow-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))'
            }}
            aria-hidden="true"
          />
          <div className="hidden sm:block text-left">
            <p className="text-[13px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Psicologia</p>
            <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {config.psychologistName}
            </h1>
            <p className="text-xs text-muted-foreground">{config.psychologistCrp || 'CRP'}</p>
          </div>
        </Link>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="nav-shell">
            <NavigationMenu viewport={false} className="flex-1 justify-end">
              <NavigationMenuList className="gap-1">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.dropdown ? (
                    <NavigationMenuTrigger className={cn('nav-link px-3 py-2 rounded-full font-semibold text-sm', isActive(item.href) && 'bg-primary/10 text-foreground')}>{item.label}</NavigationMenuTrigger>
                  ) : (
                    <NavigationMenuLink
                      href={item.href}
                      data-active={isActive(item.href)}
                      className={cn('nav-link px-3 py-2 rounded-full font-semibold text-sm', isActive(item.href) && 'bg-primary/10 text-foreground')}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.href.startsWith('#')) {
                          const element = document.getElementById(item.href.slice(1));
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          navigate(item.href);
                        }
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  )}

                  {item.dropdown && (
                    <NavigationMenuContent className="md:min-w-[320px] bg-background border-border/60 shadow-lg">
                      <div className="grid gap-2 p-3">
                        {item.dropdown.map((sub) => (
                          <NavigationMenuLink
                            key={sub.title}
                            href={sub.href}
                            data-active={isActive(sub.href)}
                            className="font-medium nav-link"
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
          </div>
          <Button
            className="btn-gradient transition-all duration-200"
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
                  'nav-link py-3 font-medium rounded-md px-1',
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
