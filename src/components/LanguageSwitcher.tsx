/**
 * Premium Language Switcher
 * Globe icon + current language code, elegant dropdown, black/white luxury design.
 * Accessible on desktop and mobile.
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { Globe, ChevronDown } from 'lucide-react';
import { supportedLanguages, type Language } from '../lib/i18n/config';

export default function LanguageSwitcher({ showLabel = false }: { showLabel?: boolean }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = supportedLanguages.find((l) => l.code === i18n.language)
    ?? supportedLanguages[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSelect = (lang: Language) => {
    setOpen(false);
    i18n.changeLanguage(lang.code);
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;

    // Swap the lang segment in the URL path
    const langPattern = supportedLanguages.map((l) => l.code.replace('-', '\\-')).join('|');
    const regex = new RegExp(`^/(${langPattern})(/|$)`);
    const newPath = location.pathname.replace(regex, `/${lang.code}$2`);
    navigate(newPath || `/${lang.code}`);
  };

  return (
    <div ref={ref} className="relative" style={{ zIndex: 9999 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('ui.currentLanguage', { name: currentLang.nativeName })}
        className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all duration-200 focus:outline-none focus-visible:ring-1"
        style={{
          color: `hsl(var(--metro-white) / 0.7)`,
          border: `1px solid hsl(var(--metro-white) / 0.12)`,
          background: 'transparent',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-heading)',
          fontWeight: 500,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white))`;
          (e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(var(--metro-white) / 0.3)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white) / 0.7)`;
          (e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(var(--metro-white) / 0.12)`;
        }}
      >
        <Globe size={13} strokeWidth={1.5} />
        {showLabel ? (
          <>
            <span className="hidden min-[370px]:inline" style={{ fontSize: '0.7rem' }}>
              {t('ui.language')}
            </span>
            <span className="min-[370px]:hidden uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>
              {currentLang.code.toUpperCase()}
            </span>
          </>
        ) : (
          <span className="hidden sm:inline uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>
            {currentLang.code.toUpperCase()}
          </span>
        )}
        <ChevronDown
          size={10}
          strokeWidth={2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label={t('ui.selectLanguage')}
          className="absolute end-0 mt-1 overflow-hidden"
          style={{
            background: `hsl(var(--metro-black))`,
            border: `1px solid hsl(var(--metro-white) / 0.12)`,
            minWidth: '180px',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: 'var(--dropdown-shadow)',
          }}
        >
          {supportedLanguages.map((lang) => {
            const isActive = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(lang)}
                className="w-full flex items-center justify-between gap-6 px-4 py-3 text-start transition-all duration-150 focus:outline-none"
                style={{
                  background: isActive ? `hsl(var(--metro-white) / 0.06)` : 'transparent',
                  color: isActive ? `hsl(var(--metro-white))` : `hsl(var(--metro-white) / 0.55)`,
                  fontSize: '0.72rem',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: `1px solid hsl(var(--metro-white) / 0.05)`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = `hsl(var(--metro-white) / 0.04)`;
                    (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white) / 0.85)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = `hsl(var(--metro-white) / 0.55)`;
                  }
                }}
              >
                <span>{lang.nativeName}</span>
                <span
                  className="uppercase"
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.12em',
                    color: isActive ? `hsl(var(--metro-white) / 0.5)` : `hsl(var(--metro-white) / 0.25)`,
                  }}
                >
                  {lang.code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
