import { useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLocalizedContent } from '@/lib/i18n/content';
import { useTranslation } from 'react-i18next';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import { waLink } from '@/lib/whatsapp';

// ─── Fade-in wrapper ─────────────────────────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === 'up' ? 28 : 0 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold tracking-[0.25em] uppercase mb-5"
      style={{ color: `hsl(var(--metro-white) / 0.35)` }}
    >
      {children}
    </p>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  children,
  size = 'lg',
}: {
  children: React.ReactNode;
  size?: 'lg' | 'md';
}) {
  return (
    <h2
      className="font-black uppercase leading-tight"
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize:
          size === 'lg'
            ? 'clamp(1.8rem, 3vw, 3rem)'
            : 'clamp(1.4rem, 2.2vw, 2.2rem)',
        color: `hsl(var(--metro-white))`,
      }}
    >
      {children}
    </h2>
  );
}

export default function AboutPage() {
  const about = useLocalizedContent('about');
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const seo = getPageSeo('about', lang);
  const canonicalUrl = getCanonicalUrl('about', lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
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
        {buildHreflangLinks('/about').map(({ hreflang, href }) => (
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
          style={{ minHeight: '70vh', background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.aboutHero')}
        >
          <img
            src="/airo-assets/images/pages/about/hero"
            alt={t('aria.altProductionStudio')}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
          {/* Overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `hsl(var(--metro-black) / 0.65)` }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent, hsl(var(--metro-black)))` }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-20 pt-40 w-full">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
              className="text-xs font-semibold tracking-[0.3em] uppercase mb-5"
              style={{ color: `hsl(var(--metro-white) / 0.45)` }}
            >
              {about.hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' as const }}
              className="font-black uppercase leading-none mb-5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                color: `hsl(var(--metro-white))`,
                letterSpacing: '-0.01em',
                maxWidth: '800px',
              }}
            >
              {about.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' as const }}
              className="text-sm font-medium tracking-[0.15em] uppercase"
              style={{ color: `hsl(var(--metro-white) / 0.5)` }}
            >
              {about.hero.subheadline}
            </motion.p>
          </div>
        </section>

        {/* ── OUR STORY ────────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.story')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <FadeIn>
                  <Eyebrow>{about.story.eyebrow}</Eyebrow>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <SectionHeading>{about.story.headline}</SectionHeading>
                </FadeIn>
                <div className="mt-8 flex flex-col gap-5">
                  {about.story.paragraphs.map((p, i) => (
                    <FadeIn key={p.id} delay={0.15 + i * 0.08}>
                      <p
                        className="text-base leading-relaxed"
                        style={{ color: `hsl(var(--metro-white) / 0.55)` }}
                      >
                        {p.text}
                      </p>
                    </FadeIn>
                  ))}
                </div>
              </div>
              {/* Image */}
              <FadeIn delay={0.15} direction="none">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src="/airo-assets/images/pages/about/story"
                    alt={t('aria.altCreativeTeam')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={900}
                    height={675}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, hsl(var(--metro-black) / 0.3) 0%, transparent 60%)` }}
                    aria-hidden="true"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ─────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.visionMission')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
              {/* Vision */}
              <FadeIn>
                <div
                  className="p-12 md:p-16 flex flex-col gap-6"
                  style={{ background: `hsl(var(--metro-black))` }}
                >
                  <Eyebrow>{about.vision.eyebrow}</Eyebrow>
                  <h2
                    className="font-black uppercase leading-tight"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.2rem, 1.8vw, 1.7rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {about.vision.headline}
                  </h2>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                  >
                    {about.vision.body}
                  </p>
                </div>
              </FadeIn>
              {/* Mission */}
              <FadeIn delay={0.1}>
                <div
                  className="p-12 md:p-16 flex flex-col gap-6"
                  style={{ background: `hsl(var(--metro-charcoal-deep))` }}
                >
                  <Eyebrow>{about.mission.eyebrow}</Eyebrow>
                  <h2
                    className="font-black uppercase leading-tight"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.2rem, 1.8vw, 1.7rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {about.mission.headline}
                  </h2>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                  >
                    {about.mission.body}
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── OUR EXPERTISE ────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.expertise')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Image */}
              <FadeIn direction="none">
                <div className="relative aspect-[4/3] overflow-hidden lg:sticky lg:top-28">
                  <img
                    src="/airo-assets/images/pages/about/expertise"
                    alt={t('aria.altProductionExpertise')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={900}
                    height={675}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, hsl(var(--metro-black) / 0.25) 0%, transparent 60%)` }}
                    aria-hidden="true"
                  />
                </div>
              </FadeIn>
              {/* Disciplines */}
              <div>
                <FadeIn>
                  <Eyebrow>{about.expertise.eyebrow}</Eyebrow>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <SectionHeading>{about.expertise.headline}</SectionHeading>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p
                    className="text-base leading-relaxed mt-6 mb-10"
                    style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                  >
                    {about.expertise.intro}
                  </p>
                </FadeIn>
                <div className="flex flex-col gap-px" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
                  {about.expertise.disciplines.map((d, i) => (
                    <FadeIn key={d.id} delay={0.1 + i * 0.07}>
                      <div
                        className="p-6 flex gap-5 group"
                        style={{ background: `hsl(var(--metro-black))` }}
                      >
                        <span
                          className="font-black shrink-0 leading-none"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.6rem',
                            color: `hsl(var(--metro-white) / 0.08)`,
                            lineHeight: 1,
                            minWidth: '2.5rem',
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3
                            className="font-bold uppercase tracking-wide mb-2"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '0.78rem',
                              color: `hsl(var(--metro-white))`,
                            }}
                          >
                            {d.title}
                          </h3>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                          >
                            {d.description}
                          </p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MEDICAL CONTENT SPECIALISATION ───────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.healthcare')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <FadeIn>
                  <Eyebrow>{about.medical.eyebrow}</Eyebrow>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <SectionHeading>{about.medical.headline}</SectionHeading>
                </FadeIn>
                <div className="mt-8 flex flex-col gap-5">
                  {about.medical.paragraphs.map((p, i) => (
                    <FadeIn key={p.id} delay={0.15 + i * 0.08}>
                      <p
                        className="text-base leading-relaxed"
                        style={{ color: `hsl(var(--metro-white) / 0.55)` }}
                      >
                        {p.text}
                      </p>
                    </FadeIn>
                  ))}
                </div>
                {/* Callout */}
                <FadeIn delay={0.4}>
                  <div
                    className="mt-8 flex items-start gap-4 p-6"
                    style={{
                      border: `1px solid hsl(var(--metro-white) / 0.1)`,
                      background: `hsl(var(--metro-charcoal-deep))`,
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 mt-0.5"
                      style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                    />
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{ color: `hsl(var(--metro-white) / 0.55)` }}
                    >
                      {about.medical.callout}
                    </p>
                  </div>
                </FadeIn>
              </div>
              {/* Image */}
              <FadeIn delay={0.15} direction="none">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src="/airo-assets/images/pages/about/medical"
                    alt={t('aria.altHealthcare')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={900}
                    height={675}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, hsl(var(--metro-black) / 0.3) 0%, transparent 60%)` }}
                    aria-hidden="true"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── CREATIVE PROCESS ─────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.creativeProcess')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Heading + image */}
              <div>
                <FadeIn>
                  <Eyebrow>{about.process.eyebrow}</Eyebrow>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <SectionHeading>{about.process.headline}</SectionHeading>
                </FadeIn>
                <FadeIn delay={0.2} direction="none">
                  <div className="relative aspect-[4/3] overflow-hidden mt-10">
                    <img
                      src="/airo-assets/images/pages/about/process"
                      alt={t('aria.altCreativeProcess')}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={900}
                      height={675}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, hsl(var(--metro-black) / 0.25) 0%, transparent 60%)` }}
                      aria-hidden="true"
                    />
                  </div>
                </FadeIn>
              </div>
              {/* Steps */}
              <div className="flex flex-col gap-px" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
                {about.process.steps.map((step, i) => (
                  <FadeIn key={step.id} delay={i * 0.1}>
                    <div
                      className="p-10 flex gap-8"
                      style={{ background: `hsl(var(--metro-black))` }}
                    >
                      <span
                        className="font-black shrink-0 leading-none"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                          color: `hsl(var(--metro-white) / 0.07)`,
                          lineHeight: 1,
                        }}
                      >
                        {step.number}
                      </span>
                      <div>
                        <h3
                          className="font-bold uppercase tracking-wide mb-3"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.85rem',
                            color: `hsl(var(--metro-white))`,
                          }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY METROPOLITAN ─────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.whyChoose')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <Eyebrow>{about.whyUs.eyebrow}</Eyebrow>
            </FadeIn>
            <FadeIn delay={0.1}>
              <SectionHeading>{about.whyUs.headline}</SectionHeading>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mt-14" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
              {about.whyUs.points.map((point, i) => (
                <FadeIn key={point.id} delay={i * 0.07}>
                  <div
                    className="p-8 flex flex-col gap-4"
                    style={{ background: `hsl(var(--metro-charcoal-deep))` }}
                  >
                    <span
                      className="font-black leading-none"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.5rem',
                        color: `hsl(var(--metro-white) / 0.06)`,
                        lineHeight: 1,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="font-bold uppercase tracking-wide"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.8rem',
                        color: `hsl(var(--metro-white))`,
                      }}
                    >
                      {point.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                    >
                      {point.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT CTA ──────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.contactCta')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center flex flex-col items-center">
            <FadeIn>
              <Eyebrow>{about.cta.eyebrow}</Eyebrow>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2
                className="font-black uppercase leading-tight mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 3.5vw, 3.5rem)',
                  color: `hsl(var(--metro-white))`,
                  maxWidth: '700px',
                }}
              >
                {about.cta.headline}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p
                className="text-base leading-relaxed mb-10"
                style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '520px' }}
              >
                {about.cta.body}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 group"
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
                {about.cta.buttonLabel}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </FadeIn>
          </div>
        </section>

      </main>
    </>
  );
}
