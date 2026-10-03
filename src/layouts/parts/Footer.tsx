import { Link } from 'react-router';
import { Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLocalizedPath from '../../hooks/useLocalizedPath';
import { waLink } from '@/lib/whatsapp';

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/metropolitan_markting/' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
];

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

export default function Footer() {
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

  return (
    <footer
      style={{
        background: `hsl(var(--metro-black))`,
        borderTop: `1px solid hsl(var(--metro-border-subtle) / 0.07)`,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Link to={localizedPath('/')} className="inline-block">
              <img
                src="/airo-assets/images/logo/horizontal"
                alt="Metropolitan Digital Marketing"
                className="block h-auto w-auto object-contain"
                style={{ maxHeight: '36px', maxWidth: '190px' }}
              />
            </Link>
            <p
              className="text-sm leading-relaxed"
              style={{ color: `hsl(var(--metro-white) / 0.45)` }}
            >
              {t('ui.footerTagline')}
            </p>
            <p
              className="text-xs tracking-[0.12em] uppercase"
              style={{ color: `hsl(var(--metro-white) / 0.3)` }}
            >
              {t('footer.location')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: `hsl(var(--metro-white) / 0.3)` }}
            >
              {t('ui.footerNavigation')}
            </p>
            <nav aria-label={t('ui.footerLinks')} className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={localizedPath(link.href)}
                  className="text-sm transition-colors duration-300 hover:text-foreground w-fit"
                  style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social + CTA */}
          <div className="flex flex-col gap-6">
            <div>
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-5"
                style={{ color: `hsl(var(--metro-white) / 0.3)` }}
              >
                {t('ui.followUs')}
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="transition-colors duration-300 hover:text-foreground"
                    style={{ color: `hsl(var(--metro-white) / 0.4)` }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
                <a
                  href="#"
                  aria-label="TikTok"
                  className="transition-colors duration-300 hover:text-foreground"
                  style={{ color: `hsl(var(--metro-white) / 0.4)` }}
                >
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 w-fit"
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
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: `1px solid hsl(var(--metro-border-subtle) / 0.07)` }}
        >
          <p className="text-xs" style={{ color: `hsl(var(--metro-white) / 0.25)` }}>
            {t('footer.copyright')}
          </p>
          <p className="text-xs" style={{ color: `hsl(var(--metro-white) / 0.2)` }}>
            {t('footer.location')}
          </p>
        </div>
      </div>
    </footer>
  );
}
