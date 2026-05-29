import { useEffect, useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const HOME_ANCHOR = '/#faq';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { config } = useSiteConfig();

  const navItems = useMemo(
    () => [
      { label: 'Início', href: '/' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Atuação', href: '/servicos' },
      { label: 'FAQ', href: HOME_ANCHOR },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contato' },
    ] as const,
    []
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToHref = (href: string) => {
    setIsMenuOpen(false);

    if (href.startsWith('/#')) {
      const targetId = href.slice(2);
      if (location !== '/') {
        navigate('/');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
        return;
      }

      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate(href);
  };

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    if (href === HOME_ANCHOR) return location === '/';
    return location === href || location.startsWith(`${href}/`);
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
        borderBottomColor: 'color-mix(in oklab, var(--accent) 30%, #ffffff 70%)',
      }}
    >
      <nav
        role="navigation"
        aria-label="Menu principal"
        className="container flex items-center justify-between py-4 md:py-5"
      >
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <div
            className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] shadow-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            aria-hidden="true"
          />
          <div className="hidden sm:block text-left">
            <p className="text-[13px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Psicologia</p>
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">{config.psychologistName}</p>
            <p className="text-xs text-muted-foreground">{config.psychologistCrp || 'CRP ativo'}</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <div className="nav-shell">
            <NavigationMenu viewport={false} className="flex-1 justify-end">
              <NavigationMenuList className="gap-1">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={isActive(item.href)}
                      className={cn(
                        'nav-link px-3 py-2 rounded-full font-semibold text-sm',
                        isActive(item.href) && 'bg-primary/10 text-foreground'
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        goToHref(item.href);
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Button className="btn-gradient transition-all duration-200" onClick={() => goToHref('/agendamento')}>
            Agendar consulta
          </Button>
        </div>

        <button
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Alternar menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn('nav-link py-3 font-medium rounded-md px-1', isActive(item.href) && 'text-accent')}
                onClick={(event) => {
                  event.preventDefault();
                  goToHref(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => goToHref('/agendamento')}
            >
              Agendar consulta
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
