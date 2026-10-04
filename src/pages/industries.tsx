import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useLocalizedContent } from '@/lib/i18n/content';
import { useTranslation } from 'react-i18next';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import { waLink, waIndustryLink } from '@/lib/whatsapp';
import useLocalizedPath from '@/hooks/useLocalizedPath';

// ─── Image slot map ───────────────────────────────────────────────────────────
const industryImages: Record<string, string> = {
  'ind-01': '/airo-assets/images/pages/industries/healthcare-hospitals',
  'ind-02': '/airo-assets/images/pages/industries/medical-clinics',
  'ind-03': '/airo-assets/images/pages/industries/luxury-brands',
  'ind-04': '/airo-assets/images/pages/industries/automotive',
  'ind-05': '/airo-assets/images/pages/industries/real-estate',
  'ind-06': '/airo-assets/images/pages/industries/interior-design',
  'ind-07': '/airo-assets/images/pages/industries/hotels-resorts',
  'ind-08': '/airo-assets/images/pages/industries/tourism-travel',
  'ind-09': '/airo-assets/images/pages/industries/sports-fitness',
  'ind-10': '/airo-assets/images/pages/industries/beauty-cosmetics',
  'ind-11': '/airo-assets/images/pages/industries/perfume-fragrance',
  'ind-12': '/airo-assets/images/pages/industries/fashion-lifestyle',
  'ind-13': '/airo-assets/images/pages/industries/restaurants-dining',
  'ind-14': '/airo-assets/images/pages/industries/technology',
  'ind-15': '/airo-assets/images/pages/industries/education',
  'ind-16': '/airo-assets/images/pages/industries/corporate',
  'ind-17': '/airo-assets/images/pages/industries/retail-ecommerce',
  'ind-18': '/airo-assets/images/pages/industries/arts-entertainment',
};

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'none';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === 'up' ? 24 : 0 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hover wrapper ────────────────────────────────────────────────────────────
function HoverCard({ children }: { children: (hovered: boolean) => React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: `hsl(var(--metro-charcoal-deep))`,
        border: `1px solid hsl(var(--metro-white) / ${hovered ? '0.12' : '0.06'})`,
        transition: 'border-color 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children(hovered)}
    </article>
  );
}

export default function IndustriesPage() {
  const industries = useLocalizedContent('industries');
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const localizedPath = useLocalizedPath();
  const seo = getPageSeo('industries', lang);
  const canonicalUrl = getCanonicalUrl('industries', lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        {buildHreflangLinks('/industries').map(({ hreflang, href }) => (
          <link key={hreflang} rel="alternate" {...{ hreflang }} href={href} />
        ))}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden flex items-end"
          style={{ minHeight: '65vh', background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.industriesHero')}
        >
          <img
            src="/airo-assets/images/pages/industries/luxury-brands"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `hsl(var(--metro-black) / 0.70)` }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent, hsl(var(--metro-black)))` }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-20 pt-44 w-full">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
              className="text-xs font-semibold tracking-[0.3em] uppercase mb-5"
              style={{ color: `hsl(var(--metro-white) / 0.4)` }}
            >
              {industries.hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: 'easeOut' as const }}
              className="font-black uppercase leading-none mb-6"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                color: `hsl(var(--metro-white))`,
                letterSpacing: '-0.01em',
                maxWidth: '860px',
              }}
            >
              {industries.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52, ease: 'easeOut' as const }}
              className="text-sm leading-relaxed"
              style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '580px' }}
            >
              {industries.hero.body}
            </motion.p>
          </div>
        </section>

        {/* ── INDUSTRY COUNT STRIP ─────────────────────────────────────────── */}
        <div
          className="py-7"
          style={{
            background: `hsl(var(--metro-charcoal-deep))`,
            borderTop: `1px solid hsl(var(--metro-white) / 0.06)`,
            borderBottom: `1px solid hsl(var(--metro-white) / 0.06)`,
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {(
                [
                  { value: '18', label: t('ui.statIndustries') },
                  { value: '16', label: t('ui.statDisciplines') },
                  { value: '15+', label: t('ui.statYears') },
                  { value: t('ui.dubai'), label: t('ui.statHeadquartered') },
                ]
              ).map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span
                    className="font-black leading-none"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-xs font-medium tracking-[0.15em] uppercase"
                    style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── INDUSTRY GRID ────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.industriesGrid')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.industries.map((ind, i) => (
                <FadeIn key={ind.id} delay={Math.min(i % 3, 2) * 0.07}>
                  <HoverCard>
                    {(hovered) => (
                      <>
                        {/* Image */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                          <img
                            src={industryImages[ind.id] ?? ''}
                            alt={ind.title}
                            className="w-full h-full object-cover"
                            style={{
                              transform: hovered ? 'scale(1.06)' : 'scale(1)',
                              transition: 'transform 0.65s ease',
                            }}
                            loading="lazy"
                            width={800}
                            height={450}
                          />
                          {/* Overlay */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `hsl(var(--metro-black) / ${hovered ? '0.3' : '0.48'})`,
                              transition: 'background 0.4s ease',
                            }}
                            aria-hidden="true"
                          />
                          {/* Number */}
                          <span
                            className="absolute top-4 left-4 font-black select-none"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '2.4rem',
                              color: `hsl(var(--metro-white) / 0.16)`,
                              lineHeight: 1,
                            }}
                          >
                            {ind.number}
                          </span>
                          {/* Tagline pill */}
                          <span
                            className="absolute bottom-4 left-4 text-xs font-semibold tracking-[0.18em] uppercase px-3 py-1"
                            style={{
                              background: `hsl(var(--metro-black) / 0.6)`,
                              color: `hsl(var(--metro-white) / 0.55)`,
                              backdropFilter: 'blur(4px)',
                            }}
                          >
                            {ind.tagline}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col flex-1 p-7">
                          {/* Title */}
                          <h2
                            className="font-black uppercase leading-tight mb-4"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: 'clamp(0.95rem, 1.15vw, 1.05rem)',
                              color: `hsl(var(--metro-white))`,
                            }}
                          >
                            {ind.title}
                          </h2>

                          {/* Description */}
                          <p
                            className="text-sm leading-relaxed mb-6"
                            style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                          >
                            {ind.description}
                          </p>

                          {/* Capabilities */}
                          <ul className="flex flex-col gap-2 mb-8">
                            {ind.capabilities.map((cap, ci) => (
                              <li key={ci} className="flex items-start gap-2.5">
                                <ChevronRight
                                  size={12}
                                  className="shrink-0 mt-0.5"
                                  style={{ color: `hsl(var(--metro-white) / 0.28)` }}
                                />
                                <span
                                  className="text-xs leading-snug"
                                  style={{ color: `hsl(var(--metro-white) / 0.42)` }}
                                >
                                  {cap}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA */}
                          <div className="mt-auto flex gap-3 flex-wrap">
                            {ind.id === 'ind-03' && (
                              <Link
                                to={localizedPath('/industries/luxury-brands')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 group/l"
                                style={{
                                  background: hovered ? `hsl(var(--metro-white))` : `hsl(var(--metro-white) / 0.9)`,
                                  color: `hsl(var(--metro-black))`,
                                }}
                              >
                                {t('ui.viewIndustry')}
                                <ArrowRight size={11} className="transition-transform duration-300 group-hover/l:translate-x-0.5" />
                              </Link>
                            )}
                            <Link
                              to={localizedPath('/services')}
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 group/s"
                              style={{
                                border: `1px solid hsl(var(--metro-white) / 0.18)`,
                                color: `hsl(var(--metro-white) / 0.75)`,
                                background: hovered ? `hsl(var(--metro-white) / 0.05)` : 'transparent',
                              }}
                            >
                              {t('ui.exploreServices')}
                              <ArrowRight size={11} className="transition-transform duration-300 group-hover/s:translate-x-0.5" />
                            </Link>
                            <a
                              href={waIndustryLink(ind.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 group/c"
                              style={{
                                background: hovered ? `hsl(var(--metro-white))` : `hsl(var(--metro-white) / 0.9)`,
                                color: `hsl(var(--metro-black))`,
                              }}
                            >
                              {t('nav.startProject')}
                              <ArrowRight size={11} className="transition-transform duration-300 group-hover/c:translate-x-0.5" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </HoverCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section
          className="py-xxl relative overflow-hidden"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.contactCta')}
        >
          {/* Decorative ghost text */}
          <span
            className="absolute inset-0 flex items-center justify-center font-black uppercase select-none pointer-events-none"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(5rem, 14vw, 14rem)',
              color: `hsl(var(--metro-white) / 0.025)`,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
            aria-hidden="true"
          >
            {t('nav.industries')}
          </span>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col items-center text-center">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-5"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {industries.cta.eyebrow}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2
                className="font-black uppercase leading-tight mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 4rem)',
                  color: `hsl(var(--metro-white))`,
                  maxWidth: '720px',
                  letterSpacing: '-0.01em',
                }}
              >
                {industries.cta.headline}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p
                className="text-base leading-relaxed mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '500px' }}
              >
                {industries.cta.body}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-9 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 group"
                style={{
                  background: `hsl(var(--metro-white))`,
                  color: `hsl(var(--metro-black))`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `hsl(var(--metro-white) / 0.88)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `hsl(var(--metro-white))`;
                }}
              >
                {industries.cta.buttonLabel}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  );
}
