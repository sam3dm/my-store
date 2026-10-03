import { useRef, useState, useCallback, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalizedContent } from '@/lib/i18n/content';
import { useTranslation } from 'react-i18next';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import { waLink } from '@/lib/whatsapp';

// ─── Image slot base path ─────────────────────────────────────────────────────
const IMG_BASE = '/airo-assets/images/pages/portfolio/';

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type PortfolioItem = {
  id: string;
  category: string;
  slot: string;
  title: string;
  label: string;
  type: string;
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  items,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  items: PortfolioItem[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const item = items[activeIndex];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: `hsl(var(--metro-overlay) / 0.95)` }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('ui.viewing', { title: item.title })}
    >
      {/* Close */}
      <button
        className="absolute top-5 right-5 z-10 p-2 transition-opacity duration-200 hover:opacity-70"
        style={{ color: `hsl(var(--metro-white))` }}
        onClick={onClose}
        aria-label={t('ui.closeLightbox')}
      >
        <X size={24} />
      </button>

      {/* Prev */}
      <button
        className="absolute left-4 md:left-8 z-10 p-3 transition-opacity duration-200 hover:opacity-70"
        style={{
          color: `hsl(var(--metro-white))`,
          border: `1px solid hsl(var(--metro-white) / 0.2)`,
          background: `hsl(var(--metro-black) / 0.6)`,
        }}
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label={t('ui.previousImage')}
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next */}
      <button
        className="absolute right-4 md:right-8 z-10 p-3 transition-opacity duration-200 hover:opacity-70"
        style={{
          color: `hsl(var(--metro-white))`,
          border: `1px solid hsl(var(--metro-white) / 0.2)`,
          background: `hsl(var(--metro-black) / 0.6)`,
        }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label={t('ui.nextImage')}
      >
        <ChevronRight size={22} />
      </button>

      {/* Image panel */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-5xl w-full mx-16 md:mx-24"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`${IMG_BASE}${item.slot}`}
          alt={item.title}
          className="w-full h-auto max-h-[80vh] object-contain"
          width={900}
          height={600}
        />
        {/* Caption */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p
              className="font-black uppercase text-sm"
              style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--metro-white))` }}
            >
              {item.title}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: `hsl(var(--metro-white) / 0.45)` }}
            >
              {item.label}
            </p>
          </div>
          <span
            className="text-xs font-semibold tracking-[0.15em] uppercase px-3 py-1 shrink-0"
            style={{
              border: `1px solid hsl(var(--metro-white) / 0.2)`,
              color: `hsl(var(--metro-white) / 0.5)`,
            }}
          >
            {item.type}
          </span>
        </div>
        {/* Counter */}
        <p
          className="absolute top-3 right-3 text-xs font-semibold px-2 py-1"
          style={{
            background: `hsl(var(--metro-black) / 0.7)`,
            color: `hsl(var(--metro-white) / 0.5)`,
          }}
        >
          {activeIndex + 1} / {items.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Hover state wrapper — layout/interaction shell only ─────────────────────
// imgSrc is a slot URL constant (not content-rooted). All content text is
// rendered by the page's .map() via the children render-prop.
function HoverCard({
  aspectRatio,
  onOpen,
  imgSrc,
  children,
}: {
  aspectRatio: string;
  onOpen: () => void;
  imgSrc: string;
  children: (hovered: boolean) => React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="group relative w-full overflow-hidden block text-left focus:outline-none focus-visible:ring-2"
      style={{ aspectRatio, background: `hsl(var(--metro-charcoal-deep))` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      {/* Image — slot URL is a constant, not a content field */}
      <img
        src={imgSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
        loading="lazy"
        width={900}
        height={600}
        aria-hidden="true"
      />
      {/* Base gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{ background: `linear-gradient(to top, hsl(var(--metro-black) / 0.75), transparent)` }}
        aria-hidden="true"
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `hsl(var(--metro-black) / ${hovered ? '0.55' : '0'})`,
          transition: 'background 0.4s ease',
        }}
        aria-hidden="true"
      />
      {/* Zoom icon */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
        aria-hidden="true"
      >
        <div
          className="p-3"
          style={{
            border: `1px solid hsl(var(--metro-white) / 0.4)`,
            background: `hsl(var(--metro-black) / 0.4)`,
          }}
        >
          <ZoomIn size={18} style={{ color: `hsl(var(--metro-white))` }} />
        </div>
      </div>
      {/* Content text — rendered inline by the page's .map() */}
      {children(hovered)}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const portfolio = useLocalizedContent('portfolio');
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const seo = getPageSeo('portfolio', lang);
  const canonicalUrl = getCanonicalUrl('portfolio', lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#webpage`,
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };

  const [activeCategory, setActiveCategory] = useState('all');
  // lightboxIndex refers to the index within the FULL items array
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Visible items (for lightbox navigation) — derived at render time, not stored
  const visibleItems = activeCategory === 'all'
    ? portfolio.items
    : portfolio.items.filter((item) => item.category === activeCategory);

  const openLightbox = useCallback((visibleIdx: number) => {
    // Map visible index back to full-array index for the lightbox
    const item = visibleItems[visibleIdx];
    const fullIdx = portfolio.items.findIndex((i) => i.id === item.id);
    setLightboxIndex(fullIdx);
  }, [visibleItems, portfolio.items]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // Navigate within visible items only
  const prevImage = useCallback(() => {
    setLightboxIndex((fullIdx) => {
      if (fullIdx === null) return null;
      const currentItem = portfolio.items[fullIdx];
      const visIdx = visibleItems.findIndex((i) => i.id === currentItem.id);
      const prevVis = (visIdx - 1 + visibleItems.length) % visibleItems.length;
      const prevItem = visibleItems[prevVis];
      return portfolio.items.findIndex((i) => i.id === prevItem.id);
    });
  }, [visibleItems, portfolio.items]);

  const nextImage = useCallback(() => {
    setLightboxIndex((fullIdx) => {
      if (fullIdx === null) return null;
      const currentItem = portfolio.items[fullIdx];
      const visIdx = visibleItems.findIndex((i) => i.id === currentItem.id);
      const nextVis = (visIdx + 1) % visibleItems.length;
      const nextItem = visibleItems[nextVis];
      return portfolio.items.findIndex((i) => i.id === nextItem.id);
    });
  }, [visibleItems, portfolio.items]);

  // Lightbox active index within visible items (for counter display)
  const lightboxVisibleIndex = lightboxIndex === null
    ? null
    : visibleItems.findIndex((i) => i.id === portfolio.items[lightboxIndex]?.id);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        {buildHreflangLinks('/portfolio').map(({ hreflang, href }) => (
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxVisibleIndex !== null && (
          <Lightbox
            items={visibleItems}
            activeIndex={lightboxVisibleIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden flex items-end"
          style={{ minHeight: '62vh', background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.portfolioHero')}
        >
          <img
            src="/airo-assets/images/pages/portfolio/cinematic-03"
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
            style={{ background: `hsl(var(--metro-black) / 0.68)` }}
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
              {portfolio.hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: 'easeOut' as const }}
              className="font-black uppercase leading-none mb-5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.6rem, 6vw, 6rem)',
                color: `hsl(var(--metro-white))`,
                letterSpacing: '-0.02em',
                maxWidth: '800px',
              }}
            >
              {portfolio.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' as const }}
              className="text-sm font-medium tracking-[0.12em] uppercase"
              style={{ color: `hsl(var(--metro-white) / 0.4)`, maxWidth: '600px' }}
            >
              {portfolio.hero.subheadline}
            </motion.p>
          </div>
        </section>

        {/* ── FILTER BAR ───────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-40 py-4"
          style={{
            background: `hsl(var(--metro-black) / 0.92)`,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid hsl(var(--metro-white) / 0.07)`,
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' } as React.CSSProperties}
              role="group"
              aria-label={t('aria.portfolioFilter')}
            >
              {portfolio.categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="shrink-0 px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-200"
                    style={{
                      background: isActive
                        ? `hsl(var(--metro-white))`
                        : `hsl(var(--metro-white) / 0.04)`,
                      color: isActive
                        ? `hsl(var(--metro-black))`
                        : `hsl(var(--metro-white) / 0.5)`,
                      border: `1px solid ${isActive ? 'transparent' : 'hsl(var(--metro-white) / 0.1)'}`,
                    }}
                    aria-pressed={isActive}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── GALLERY GRID ─────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.portfolioGallery')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">

            {/* Result count — driven by visible count */}
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.3)` }}
              >
                <span>{t('ui.workCount', { count: visibleItems.length })}</span>
                {activeCategory !== 'all' && (
                  <span style={{ color: `hsl(var(--metro-white) / 0.18)` }}>
                    <span> — </span>
                    <span>{portfolio.categories.find((c) => c.id === activeCategory)?.label}</span>
                  </span>
                )}
              </p>
            </FadeIn>

            {/* All items rendered; hidden ones are display:none so content keys are preserved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.items.map((item, i) => {
                const isVisible = activeCategory === 'all' || item.category === activeCategory;
                const visPos = visibleItems.findIndex((v) => v.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={[
                      i % 7 === 0 ? 'sm:col-span-2 lg:col-span-2' : '',
                      isVisible ? '' : 'hidden',
                    ].join(' ')}
                  >
                    <FadeIn delay={Math.min(visPos % 4, 3) * 0.06}>
                      <HoverCard
                        aspectRatio={i % 7 === 0 ? '4/3' : '16/10'}
                        onOpen={() => openLightbox(visPos)}
                        imgSrc={`${IMG_BASE}${item.slot}`}
                      >
                        {(hovered) => (
                          <div
                            className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2"
                            style={{
                              opacity: hovered ? 1 : 0.85,
                              transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                              transition: 'opacity 0.3s ease, transform 0.3s ease',
                            }}
                          >
                            <div className="min-w-0">
                              <p
                                className="font-black uppercase text-xs leading-tight truncate"
                                style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--metro-white))` }}
                              >
                                {item.title}
                              </p>
                              <p
                                className="text-xs mt-0.5 truncate"
                                style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                              >
                                {item.label}
                              </p>
                            </div>
                            <span
                              className="text-xs font-semibold tracking-[0.12em] uppercase px-2 py-0.5 shrink-0"
                              style={{
                                background: `hsl(var(--metro-black) / 0.6)`,
                                color: `hsl(var(--metro-white) / 0.55)`,
                                backdropFilter: 'blur(4px)',
                                border: `1px solid hsl(var(--metro-white) / 0.12)`,
                              }}
                            >
                              {item.type}
                            </span>
                          </div>
                        )}
                      </HoverCard>
                    </FadeIn>
                  </div>
                );
              })}
            </div>

            {visibleItems.length === 0 && (
              <div className="py-24 text-center">
                <p
                  className="text-sm"
                  style={{ color: `hsl(var(--metro-white) / 0.3)` }}
                >
                  No works in this category yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
        <div
          className="py-8"
          style={{
            background: `hsl(var(--metro-charcoal-deep))`,
            borderTop: `1px solid hsl(var(--metro-white) / 0.06)`,
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <p
              className="text-xs leading-relaxed"
              style={{ color: `hsl(var(--metro-white) / 0.28)`, maxWidth: '720px' }}
            >
              <span
                className="font-semibold uppercase tracking-[0.12em]"
                style={{ color: `hsl(var(--metro-white) / 0.4)` }}
              >
                {t('ui.note')}
              </span>
              {' '}{t('ui.portfolioNote')}
            </p>
          </div>
        </div>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section
          className="py-xxl relative overflow-hidden"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.contactCta')}
        >
          {/* Ghost watermark */}
          <span
            className="absolute inset-0 flex items-center justify-center font-black uppercase select-none pointer-events-none"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(4rem, 13vw, 13rem)',
              color: `hsl(var(--metro-white) / 0.022)`,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
            aria-hidden="true"
          >
            {t('nav.portfolio')}
          </span>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col items-center text-center">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.28em] uppercase mb-5"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {portfolio.cta.eyebrow}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2
                className="font-black uppercase leading-tight mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
                  color: `hsl(var(--metro-white))`,
                  maxWidth: '740px',
                  letterSpacing: '-0.015em',
                }}
              >
                {portfolio.cta.headline}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p
                className="text-base leading-relaxed mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '480px' }}
              >
                {portfolio.cta.body}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 group"
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
                {portfolio.cta.buttonLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  );
}
