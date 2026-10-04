import { useRef } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SITE_URL, OG_IMAGE, getPageSeo, getCanonicalUrl } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import useLocalizedPath from '@/hooks/useLocalizedPath';
import { useLocalizedContent } from '@/lib/i18n/content';

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
const WA_LUXURY =
  'https://wa.me/971508221108?text=' +
  encodeURIComponent(
    'Hello Metropolitan Digital Marketing, I would like to discuss a Luxury Brands project and request information about your cinematic production and advertising services.'
  );


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
  direction?: 'up' | 'left' | 'none';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const initial =
    direction === 'up'
      ? { opacity: 0, y: 28 }
      : direction === 'left'
        ? { opacity: 0, x: -24 }
        : { opacity: 0 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.65, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LuxuryBrandsPage() {
  const luxury_brands = useLocalizedContent('luxury_brands');
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const localizedPath = useLocalizedPath();

  const canonicalUrl = getCanonicalUrl('luxury-brands', lang);
  const seo = getPageSeo('luxury-brands', lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: seo.title,
    url: canonicalUrl,
    description: seo.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        {buildHreflangLinks('/industries/luxury-brands').map(({ hreflang, href }) => (
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
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      </Helmet>

      <main style={{ background: `hsl(var(--metro-black))`, color: `hsl(var(--metro-white))` }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          className="relative flex items-end overflow-hidden"
          style={{ minHeight: 'clamp(480px, 60vh, 720px)' }}
          aria-label={t('aria.luxuryHero')}
        >
          {/* Background image */}
          <img
            src="/airo-assets/images/pages/luxury-brands/hero"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={900}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, hsl(var(--metro-black)) 0%, hsl(var(--metro-black) / 0.72) 45%, hsl(var(--metro-black) / 0.28) 100%)',
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pb-16 md:pb-20">
            {/* Breadcrumb */}
            <FadeIn delay={0.05}>
              <nav aria-label={t('aria.breadcrumb')} className="flex items-center gap-2 mb-8">
                <Link
                  to={localizedPath('/industries')}
                  className="text-xs font-semibold tracking-[0.18em] uppercase transition-opacity duration-200 hover:opacity-100"
                  style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                >
                  {t('nav.industries')}
                </Link>
                <ChevronRight size={12} style={{ color: `hsl(var(--metro-white) / 0.25)` }} aria-hidden="true" />
                <span
                  className="text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: `hsl(var(--metro-white) / 0.75)` }}
                >
                  {t('ui.luxuryBrands')}
                </span>
              </nav>
            </FadeIn>

            {/* Eyebrow */}
            <FadeIn delay={0.1}>
              <p
                className="text-xs font-semibold tracking-[0.28em] uppercase mb-5"
                style={{ color: `hsl(var(--metro-white) / 0.38)` }}
              >
                <span>{luxury_brands.hero.eyebrow}</span>
              </p>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={0.18}>
              <h1
                className="font-black uppercase leading-none mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
                  color: `hsl(var(--metro-white))`,
                  letterSpacing: '-0.01em',
                }}
              >
                <span>{luxury_brands.hero.headline}</span>
              </h1>
            </FadeIn>

            {/* Intro */}
            <FadeIn delay={0.26}>
              <p
                className="max-w-2xl leading-relaxed"
                style={{
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  color: `hsl(var(--metro-white) / 0.58)`,
                }}
              >
                <span>{luxury_brands.hero.intro}</span>
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── CAPABILITIES STRIP ────────────────────────────────────────────── */}
        <section
          className="py-10 border-y"
          style={{
            background: `hsl(var(--metro-black))`,
            borderColor: `hsl(var(--metro-white) / 0.07)`,
          }}
          aria-label={t('aria.capabilities')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {luxury_brands.capabilities.map((cap, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase"
                  style={{ color: `hsl(var(--metro-white) / 0.42)` }}
                >
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: `hsl(var(--metro-white) / 0.22)` }}
                    aria-hidden="true"
                  />
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ───────────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.productionGallery')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">

            {/* Section heading */}
            <FadeIn delay={0} className="mb-16">
              <p
                className="text-xs font-semibold tracking-[0.28em] uppercase mb-4"
                style={{ color: `hsl(var(--metro-white) / 0.28)` }}
              >
                <span>{luxury_brands.gallery.eyebrow}</span>
              </p>
              <h2
                className="font-black uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                <span>{luxury_brands.gallery.heading}</span>
              </h2>
              <p
                className="mt-4 max-w-xl text-sm leading-relaxed"
                style={{ color: `hsl(var(--metro-white) / 0.42)` }}
              >
                <span>{luxury_brands.gallery.disclaimer}</span>
              </p>
            </FadeIn>

            {/* Gallery grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: `hsl(var(--metro-white) / 0.06)` }}>
              {luxury_brands.gallery.items.map((item, i) => (
                <FadeIn key={item.number} delay={Math.min(i % 2, 1) * 0.08}>
                  <article
                    className="flex flex-col"
                    style={{ background: `hsl(var(--metro-black))` }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={item.slot}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                        width={900}
                        height={506}
                      />
                      {/* Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(to top, hsl(var(--metro-black) / 0.55) 0%, transparent 60%)`,
                        }}
                        aria-hidden="true"
                      />
                      {/* Number */}
                      <span
                        className="absolute top-4 left-5 font-black select-none"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '2.2rem',
                          color: `hsl(var(--metro-white) / 0.14)`,
                          lineHeight: 1,
                        }}
                        aria-hidden="true"
                      >
                        {item.number}
                      </span>
                      {/* Service pill */}
                      <span
                        className="absolute bottom-4 left-5 text-xs font-semibold tracking-[0.16em] uppercase px-3 py-1"
                        style={{
                          background: `hsl(var(--metro-black) / 0.65)`,
                          color: `hsl(var(--metro-white) / 0.55)`,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {item.service}
                      </span>
                      {/* Conceptual label */}
                      <span
                        className="absolute top-4 right-5 text-xs font-medium tracking-[0.12em] uppercase px-2.5 py-1"
                        style={{
                          background: `hsl(var(--metro-white) / 0.08)`,
                          color: `hsl(var(--metro-white) / 0.38)`,
                          backdropFilter: 'blur(4px)',
                          border: `1px solid hsl(var(--metro-white) / 0.1)`,
                        }}
                      >
                        {item.note}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-8 md:p-10">
                      <h3
                        className="font-black uppercase leading-tight mb-4"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                          color: `hsl(var(--metro-white))`,
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-6"
                        style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                      >
                        {item.description}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {item.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="text-xs font-semibold tracking-[0.12em] uppercase px-3 py-1"
                            style={{
                              border: `1px solid hsl(var(--metro-white) / 0.12)`,
                              color: `hsl(var(--metro-white) / 0.35)`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTION PROCESS ────────────────────────────────────────────── */}
        <section
          className="py-xxl border-t"
          style={{
            background: `hsl(var(--metro-black))`,
            borderColor: `hsl(var(--metro-white) / 0.07)`,
          }}
          aria-label={t('aria.productionProcess')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn className="mb-14">
              <p
                className="text-xs font-semibold tracking-[0.28em] uppercase mb-4"
                style={{ color: `hsl(var(--metro-white) / 0.28)` }}
              >
                <span>{luxury_brands.process.eyebrow}</span>
              </p>
              <h2
                className="font-black uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                <span>{luxury_brands.process.heading}</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: `hsl(var(--metro-white) / 0.06)` }}>
              {luxury_brands.process.steps.map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.08}>
                  <div
                    className="flex flex-col p-8 md:p-10 h-full"
                    style={{ background: `hsl(var(--metro-black))` }}
                  >
                    <span
                      className="font-black leading-none mb-6 select-none"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '3rem',
                        color: `hsl(var(--metro-white) / 0.08)`,
                      }}
                      aria-hidden="true"
                    >
                      {s.step}
                    </span>
                    <h3
                      className="font-black uppercase leading-tight mb-4"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem',
                        letterSpacing: '0.12em',
                        color: `hsl(var(--metro-white))`,
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                    >
                      {s.body}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIGITAL MARKETING SERVICES ────────────────────────────────────── */}
        <section
          className="py-xxl border-t"
          style={{
            background: `hsl(var(--metro-black))`,
            borderColor: `hsl(var(--metro-white) / 0.07)`,
          }}
          aria-label={t('aria.luxuryServices')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <FadeIn direction="left">
                <p
                  className="text-xs font-semibold tracking-[0.28em] uppercase mb-4"
                  style={{ color: `hsl(var(--metro-white) / 0.28)` }}
                >
                  <span>{luxury_brands.services.eyebrow}</span>
                </p>
                <h2
                  className="font-black uppercase leading-none mb-6"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                    color: `hsl(var(--metro-white))`,
                  }}
                >
                  <span>{luxury_brands.services.heading}</span>
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `hsl(var(--metro-white) / 0.48)` }}
                >
                  <span>{luxury_brands.services.body}</span>
                </p>
              </FadeIn>

              <FadeIn delay={0.1}>
                <ul className="flex flex-col gap-0 divide-y" style={{ borderColor: `hsl(var(--metro-white) / 0.07)` }}>
                  {luxury_brands.services.items.map(({ title, description: desc }, i) => (
                    <li key={i} className="flex items-start gap-4 py-5">
                      <ChevronRight
                        size={13}
                        className="shrink-0 mt-0.5"
                        style={{ color: `hsl(var(--metro-white) / 0.22)` }}
                        aria-hidden="true"
                      />
                      <div>
                        <p
                          className="text-xs font-semibold tracking-[0.12em] uppercase mb-1"
                          style={{ color: `hsl(var(--metro-white) / 0.75)` }}
                        >
                          {title}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: `hsl(var(--metro-white) / 0.38)` }}
                        >
                          {desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section
          className="py-xxl border-t"
          style={{
            background: `hsl(var(--metro-black))`,
            borderColor: `hsl(var(--metro-white) / 0.07)`,
          }}
          aria-label={t('aria.luxuryCta')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.28em] uppercase mb-6"
                style={{ color: `hsl(var(--metro-white) / 0.28)` }}
              >
                <span>{luxury_brands.cta.eyebrow}</span>
              </p>
              <h2
                className="font-black uppercase leading-none mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                <span>{luxury_brands.cta.heading}</span>
              </h2>
              <p
                className="max-w-xl mx-auto text-sm leading-relaxed mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.45)` }}
              >
                <span>{luxury_brands.cta.body}</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={WA_LUXURY}
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
                  <span>{luxury_brands.cta.primaryButton}</span>
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <Link
                  to={localizedPath('/services')}
                  className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300"
                  style={{
                    border: `1px solid hsl(var(--metro-white) / 0.2)`,
                    color: `hsl(var(--metro-white) / 0.65)`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white) / 0.45)`;
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white) / 0.2)`;
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white) / 0.65)`;
                  }}
                >
                  <span>{luxury_brands.cta.secondaryButton}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </FadeIn>

            {/* Back to Industries */}
            <FadeIn delay={0.2} className="mt-12">
              <Link
                to={localizedPath('/industries')}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase transition-opacity duration-200 hover:opacity-100"
                style={{ color: `hsl(var(--metro-white) / 0.28)` }}
              >
                <span>{luxury_brands.cta.backLink}</span>
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  );
}
