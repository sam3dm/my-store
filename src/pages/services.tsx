import { useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { services } from 'virtual:content';
import { useTranslation } from 'react-i18next';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import { waLink, waServiceLink } from '@/lib/whatsapp';

// ─── Image slot map (code — not content) ─────────────────────────────────────
const serviceImages: Record<string, string> = {
  'svc-01': '/airo-assets/images/pages/services/social-media-management',
  'svc-02': '/airo-assets/images/pages/services/content-creation',
  'svc-03': '/airo-assets/images/pages/services/video-production',
  'svc-04': '/airo-assets/images/pages/services/3d-animation-cgi',
  'svc-05': '/airo-assets/images/pages/services/vfx-post-production',
  'svc-06': '/airo-assets/images/pages/services/ai-production',
  'svc-07': '/airo-assets/images/pages/services/medical-content',
  'svc-08': '/airo-assets/images/pages/services/podcast-production',
  'svc-09': '/airo-assets/images/pages/services/commercial-photography',
  'svc-10': '/airo-assets/images/pages/services/branding-design',
  'svc-11': '/airo-assets/images/pages/services/website-design',
  'svc-12': '/airo-assets/images/pages/services/digital-marketing',
  'svc-13': '/airo-assets/images/pages/services/scriptwriting',
  'svc-14': '/airo-assets/images/pages/services/voiceover-audio',
  'svc-15': '/airo-assets/images/pages/services/luxury-advertising',
  'svc-16': '/airo-assets/images/pages/services/content-creator',
  'svc-17': '/airo-assets/images/pages/services/social-media-advertising',
  'svc-18': '/airo-assets/images/pages/services/influencer-marketing',
  'svc-19': '/airo-assets/images/pages/services/integrated-advertising',
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

// ─── Hover state wrapper for each card ───────────────────────────────────────
function HoverCard({ children }: { children: (hovered: boolean) => React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="group flex flex-col h-full overflow-hidden"
      style={{
        background: `hsl(var(--metro-charcoal-deep))`,
        border: `1px solid hsl(var(--metro-white) / 0.06)`,
        transition: 'border-color 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children(hovered)}
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const seo = getPageSeo('services', lang);
  const canonicalUrl = getCanonicalUrl('services', lang);

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
        {buildHreflangLinks('/services').map(({ hreflang, href }) => (
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
          aria-label="Services hero"
        >
          <img
            src="/airo-assets/images/pages/services/video-production"
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
            style={{ background: `hsl(var(--metro-black) / 0.72)` }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
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
              {services.hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: 'easeOut' as const }}
              className="font-black uppercase leading-none mb-5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                color: `hsl(var(--metro-white))`,
                letterSpacing: '-0.01em',
                maxWidth: '860px',
              }}
            >
              {services.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.48, ease: 'easeOut' as const }}
              className="text-sm font-medium tracking-[0.15em] uppercase mb-5"
              style={{ color: `hsl(var(--metro-white) / 0.45)` }}
            >
              {services.hero.subheadline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' as const }}
              className="text-sm leading-relaxed"
              style={{ color: `hsl(var(--metro-white) / 0.45)`, maxWidth: '560px' }}
            >
              {services.hero.body}
            </motion.p>
          </div>
        </section>

        {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
        <div
          className="py-8"
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
                  { value: '19', label: 'Creative Disciplines' },
                  { value: '15+', label: 'Years of Expertise' },
                  { value: '10+', label: 'Industries Served' },
                  { value: 'Dubai', label: 'Headquartered' },
                ] as const
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

        {/* ── SERVICE GRID ─────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label="All services"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.services.map((svc, i) => (
                <FadeIn key={svc.id} delay={Math.min(i % 3, 2) * 0.08}>
                  <HoverCard>
                    {(hovered) => (
                      <>
                        {/* Image */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                          <img
                            src={serviceImages[svc.id] ?? ''}
                            alt={svc.title}
                            className="w-full h-full object-cover"
                            style={{
                              transform: hovered ? 'scale(1.05)' : 'scale(1)',
                              transition: 'transform 0.6s ease',
                            }}
                            loading="lazy"
                            width={800}
                            height={450}
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `hsl(var(--metro-black) / 0.45)`,
                              opacity: hovered ? 0.3 : 0.45,
                              transition: 'opacity 0.4s ease',
                            }}
                            aria-hidden="true"
                          />
                          <span
                            className="absolute top-4 left-4 font-black leading-none select-none"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '2.2rem',
                              color: `hsl(var(--metro-white) / 0.18)`,
                              lineHeight: 1,
                            }}
                          >
                            {svc.number}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col flex-1 p-7">
                          <p
                            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
                            style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                          >
                            {svc.tagline}
                          </p>
                          <h2
                            className="font-black uppercase leading-tight mb-4"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
                              color: `hsl(var(--metro-white))`,
                            }}
                          >
                            {svc.title}
                          </h2>
                          <p
                            className="text-sm leading-relaxed mb-6"
                            style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                          >
                            {svc.description}
                          </p>

                          {/* Deliverables */}
                          <ul className="flex flex-col gap-2 mb-8">
                            {svc.deliverables.map((item, di) => (
                              <li key={di} className="flex items-start gap-2.5">
                                <CheckCircle2
                                  size={13}
                                  className="shrink-0 mt-0.5"
                                  style={{ color: `hsl(var(--metro-white) / 0.3)` }}
                                />
                                <span
                                  className="text-xs leading-snug"
                                  style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                                >
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA */}
                          <div className="mt-auto">
                            <a
                              href={waServiceLink(svc.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 group/btn"
                              style={{
                                border: `1px solid hsl(var(--metro-white) / 0.2)`,
                                color: `hsl(var(--metro-white))`,
                                background: hovered
                                  ? `hsl(var(--metro-white) / 0.06)`
                                  : 'transparent',
                              }}
                            >
                              Start Your Project
                              <ArrowRight
                                size={12}
                                className="transition-transform duration-300 group-hover/btn:translate-x-1"
                              />
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
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label="Contact call to action"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col items-center text-center">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-5"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {services.cta.eyebrow}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2
                className="font-black uppercase leading-tight mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 4rem)',
                  color: `hsl(var(--metro-white))`,
                  maxWidth: '700px',
                  letterSpacing: '-0.01em',
                }}
              >
                {services.cta.headline}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p
                className="text-base leading-relaxed mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '500px' }}
              >
                {services.cta.body}
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
                {services.cta.buttonLabel}
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
