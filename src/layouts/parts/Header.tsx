import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import useLocalizedPath from '../../hooks/useLocalizedPath';
import { openChat } from '../../components/chat/openChat';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();

  const navLinks = [
    { labelKey: 'nav.home',       href: '/' },
    { labelKey: 'nav.about',      href: '/about' },
    { labelKey: 'nav.services',   href: '/services' },
    { labelKey: 'nav.industries', href: '/industries' },
    { labelKey: 'nav.portfolio',  href: '/portfolio' },
    { labelKey: 'nav.contact',    href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Determine active path: strip the lang prefix for comparison
  const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? `hsl(var(--metro-header-scrolled) / 0.95)`
            : 'transparent',
          borderBottom: scrolled
            ? `1px solid hsl(var(--metro-border-subtle) / 0.07)`
            : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between gap-4 h-20">

          {/* Logo */}
          <Link to={localizedPath('/')} className="flex items-center shrink-0 min-w-0">
            <img
              src="/airo-assets/images/logo/horizontal"
              alt="Metropolitan Digital Marketing"
              className="block h-auto w-auto object-contain self-center"
              style={{ maxHeight: '52px', maxWidth: '240px' }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label={t('ui.mainNavigation')} className="hidden xl:flex items-center gap-5 2xl:gap-8 whitespace-nowrap">
            {navLinks.map((link) => {
              const localHref = localizedPath(link.href);
              const isActive = pathWithoutLang === link.href || (link.href === '/' && pathWithoutLang === '');
              return (
                <Link
                  key={link.href}
                  to={localHref}
                  className="relative whitespace-nowrap text-xs font-medium tracking-[0.1em] 2xl:tracking-[0.15em] uppercase transition-colors duration-300 group"
                  style={{
                    color: isActive
                      ? `hsl(var(--metro-white))`
                      : `hsl(var(--metro-white) / 0.55)`,
                  }}
                >
                  {t(link.labelKey)}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px transition-all duration-300 ease-out"
                    style={{
                      width: isActive ? '100%' : '0%',
                      background: `hsl(var(--metro-white))`,
                    }}
                  />
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out"
                    style={{ background: `hsl(var(--metro-white))` }}
                  />
                </Link>
              );
            })}
            <button
              type="button"
              onClick={openChat}
              className="relative inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium tracking-[0.1em] 2xl:tracking-[0.15em] uppercase transition-colors duration-300"
              style={{ color: `hsl(var(--metro-white) / 0.55)` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white))`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white) / 0.55)`; }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: '#4ade80' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#4ade80' }} />
              </span>
              {t('nav.chat')}
            </button>
          </nav>

          {/* CTA + Language Switcher + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Language Switcher — desktop */}
            <div className="hidden xl:block">
              <LanguageSwitcher />
            </div>

            <Link
              to={localizedPath('/contact')}
              className="hidden 2xl:inline-flex items-center whitespace-nowrap px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300"
              style={{
                border: `1px solid hsl(var(--metro-white))`,
                color: `hsl(var(--metro-white))`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `hsl(var(--metro-white))`;
                (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-black))`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
              }}
            >
              {t('nav.startProject')}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden flex items-center justify-center w-10 h-10"
              style={{ color: `hsl(var(--metro-white))` }}
              aria-label={menuOpen ? t('ui.closeMenu') : t('ui.openMenu')}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col xl:hidden transition-all duration-500"
        style={{
          background: `hsl(var(--metro-black))`,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        <div className="flex flex-col justify-center items-center h-full gap-8 px-8">
          {/* Logo in mobile menu */}
          <img
            src="/airo-assets/images/logo/horizontal"
            alt="Metropolitan Digital Marketing"
            className="block h-auto w-auto object-contain mb-2"
            style={{ maxHeight: '48px', maxWidth: '220px', opacity: menuOpen ? 1 : 0, transition: 'opacity 0.4s ease' }}
          />

          {/* Language switcher — mobile */}
          <div style={{ opacity: menuOpen ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <LanguageSwitcher />
          </div>

          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              to={localizedPath(link.href)}
              className="text-2xl font-bold tracking-[0.2em] uppercase transition-all duration-300"
              style={{
                color: `hsl(var(--metro-white))`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(8px)',
                transitionDelay: menuOpen ? `${i * 55}ms` : '0ms',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); openChat(); }}
            className="text-2xl font-bold tracking-[0.2em] uppercase transition-all duration-300"
            style={{ color: `hsl(var(--metro-white))`, opacity: menuOpen ? 1 : 0, fontFamily: 'var(--font-heading)' }}
          >
            {t('nav.chat')}
          </button>
          <Link
            to={localizedPath('/contact')}
            className="mt-4 inline-flex items-center px-8 py-3 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              background: `hsl(var(--metro-white))`,
              color: `hsl(var(--metro-black))`,
              opacity: menuOpen ? 1 : 0,
              transitionDelay: menuOpen ? `${navLinks.length * 55}ms` : '0ms',
            }}
          >
            {t('nav.startProject')}
          </Link>
        </div>
      </div>
    </>
  );
}
