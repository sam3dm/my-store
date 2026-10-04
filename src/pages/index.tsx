import { useLocalizedContent } from '@/lib/i18n/content';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import useLocalizedPath from '@/hooks/useLocalizedPath';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE, BRAND } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';
import { waLink } from '@/lib/whatsapp';

// ─── Fade-in wrapper ────────────────────────────────────────────────────────
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
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Service card data (text comes from the locale files: home.svcNTitle…) ───
const featuredServiceSlots = [
  '/airo-assets/images/pages/home/service-social-media',
  '/airo-assets/images/pages/home/service-video-production',
  '/airo-assets/images/pages/home/service-3d-cgi',
  '/airo-assets/images/pages/home/service-vfx',
  '/airo-assets/images/pages/home/service-ai-production',
  '/airo-assets/images/pages/home/service-branding',
];

// ─── Portfolio previews (text comes from home.portfolioNTitle…) ──────────────
// ─── Specialties strip: portfolio categories with their own image (labels come from portfolio content) ───
const specialtySlots: { id: string; src: string }[] = [
  { id: 'interior', src: '/airo-assets/images/pages/home/specialty-interior' },
  { id: 'realestate', src: '/airo-assets/images/pages/home/specialty-realestate' },
  { id: 'medical', src: '/airo-assets/images/pages/home/specialty-medical' },
  { id: 'hotel', src: '/airo-assets/images/pages/home/specialty-hotel' },
  { id: 'automotive', src: '/airo-assets/images/pages/home/specialty-automotive' },
];

// Where each industry tag on the home page leads (same order as home.industries).
const industryLinks: string[] = [
  '/industries/luxury-brands',
  '/portfolio?c=medical',
  '/portfolio?c=automotive',
  '/portfolio?c=hotel',
  '/portfolio?c=realestate',
  '/industries',
  '/industries',
  '/industries',
  '/portfolio?c=beauty',
  '/portfolio?c=hotel',
];

const portfolioSlots = [
  '/airo-assets/images/pages/home/portfolio-1',
  '/airo-assets/images/pages/home/portfolio-2',
  '/airo-assets/images/pages/home/portfolio-3',
];

type FeaturedService = { number: string; title: string; description: string; slot: string };
type PortfolioPreview = { category: string; title: string; slot: string };

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const home = useLocalizedContent('home');
  const portfolioContent = useLocalizedContent('portfolio');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { t, i18n } = useTranslation();
  const localizedPath = useLocalizedPath();
  const featuredServices: FeaturedService[] = featuredServiceSlots.map((slot, i) => ({
    number: t(`home.svc${i + 1}Number`),
    title: t(`home.svc${i + 1}Title`),
    description: t(`home.svc${i + 1}Description`),
    slot,
  }));
  const portfolioItems: PortfolioPreview[] = portfolioSlots.map((slot, i) => ({
    category: t(`home.portfolio${i + 1}Category`),
    title: t(`home.portfolio${i + 1}Title`),
    slot,
  }));
  const lang = i18n.language || 'en';
  const seo = getPageSeo('home', lang);
  const canonicalUrl = getCanonicalUrl('home', lang);

  // JSON-LD: LocalBusiness + WebSite + WebPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND,
        url: `${SITE_URL}/`,
        inLanguage: lang,
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${SITE_URL}/#organization`,
        name: BRAND,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/airo-assets/images/logo/horizontal`,
        image: OG_IMAGE,
        description: 'Dubai-based digital marketing and cinematic production agency delivering social media strategy, video production, 3D animation, CGI, VFX and AI creative solutions.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dubai',
          addressCountry: 'AE',
        },
        areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
        telephone: '+971508221108',
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
        ],
        email: 'info@metropolitandigitalmarketing.com',
        sameAs: [
          'https://www.instagram.com/metropolitandigitalmarketing',
          'https://www.youtube.com/@metropolitandigitalmarketing',
          'https://www.linkedin.com/company/metropolitan-digital-marketing',
          'https://www.facebook.com/metropolitandigitalmarketing',
          'https://www.tiktok.com/@metropolitandigitalmarketing',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        inLanguage: lang,
        datePublished: '2026-09-17',
        dateModified: '2026-09-17',
      },
    ],
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // Some phones (iOS Low Power Mode, data saver) refuse autoplay: start the muted loop on the first touch or scroll instead.
      const start = () => v.play().catch(() => {});
      window.addEventListener('touchstart', start, { once: true, passive: true });
      window.addEventListener('scroll', start, { once: true, passive: true });
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        {buildHreflangLinks('').map(({ hreflang, href }) => (
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
          className="relative w-full overflow-hidden"
          style={{ height: '100svh', minHeight: '600px' }}
          aria-label={t('aria.hero')}
        >
          {/* Video background */}
          <video
            ref={videoRef}
            src="/airo-assets/videos/pages/home/hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            onCanPlay={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: videoLoaded ? 1 : 0 }}
            aria-hidden="true"
          />
          {/* Fallback image */}
          <img
            src="/airo-assets/images/pages/home/hero-fallback"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: videoLoaded ? 0 : 1, transition: 'opacity 1s' }}
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `hsl(var(--metro-black) / 0.62)` }}
            aria-hidden="true"
          />
          {/* Gradient vignette bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, hsl(var(--metro-black)))`,
            }}
            aria-hidden="true"
          />

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="text-xs font-medium tracking-[0.3em] uppercase mb-6"
              style={{ color: `hsl(var(--metro-white) / 0.55)` }}
            >
              {t('home.heroTagline')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
              className="uppercase font-black leading-tight tracking-widest mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.05rem, 2.6vw, 2.2rem)',
                fontWeight: 900,
                letterSpacing: '0.22em',
                color: `hsl(var(--metro-white))`,
                maxWidth: '860px',
                wordBreak: 'break-word',
              }}
            >
              Metropolitan Digital Marketing
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.42, ease: 'easeOut' }}
              className="font-black uppercase leading-none tracking-tight mb-6"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 6vw, 6rem)',
                letterSpacing: '-0.01em',
                color: `hsl(var(--metro-white))`,
                maxWidth: '900px',
              }}
            >
              {t('home.heroHeadline')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
              className="text-sm md:text-base font-medium tracking-[0.12em] uppercase mb-5"
              style={{ color: `hsl(var(--metro-white) / 0.65)`, maxWidth: '640px' }}
            >
              {t('home.heroSubtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
              className="text-sm leading-relaxed mb-10"
              style={{ color: `hsl(var(--metro-white) / 0.5)`, maxWidth: '520px' }}
            >
              {t('home.heroBody')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.88, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <Link
                to={localizedPath('/portfolio')}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  border: `1px solid hsl(var(--metro-white) / 0.5)`,
                  color: `hsl(var(--metro-white))`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white))`;
                  (e.currentTarget as HTMLAnchorElement).style.background = `hsl(var(--metro-white) / 0.08)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white) / 0.5)`;
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }}
              >
                {t('home.heroCta')}
              </Link>
              <Link
                to={localizedPath('/services')}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  border: `1px solid hsl(var(--metro-white) / 0.5)`,
                  color: `hsl(var(--metro-white))`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white))`;
                  (e.currentTarget as HTMLAnchorElement).style.background = `hsl(var(--metro-white) / 0.08)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white) / 0.5)`;
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }}
              >
                {t('home.heroCtaServices')}
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300"
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
                {t('home.heroCtaSecondary')}
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── COMPANY INTRODUCTION ─────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.companyIntro')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <FadeIn>
                  <p
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-6"
                    style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                  >
                    {t('home.introEyebrow')}
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h2
                    className="font-black uppercase leading-tight mb-8"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {t('home.introHeadline')}
                  </h2>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <p
                    className="text-base leading-relaxed mb-6"
                    style={{ color: `hsl(var(--metro-white) / 0.55)` }}
                  >
                    {t('home.introBody')}
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p
                    className="text-base leading-relaxed mb-10"
                    style={{ color: `hsl(var(--metro-white) / 0.45)` }}
                  >
                    {t('home.introBody2')}
                  </p>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <Link
                    to={localizedPath('/about')}
                    className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-300 group"
                    style={{ color: `hsl(var(--metro-white))` }}
                  >
                    {t('home.introLink')}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </FadeIn>
              </div>

              <FadeIn delay={0.15} direction="none">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src="/airo-assets/images/pages/home/company-intro"
                    alt={t('aria.altCreativeStudio')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--metro-black) / 0.3) 0%, transparent 60%)`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── FEATURED SERVICES ────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.featuredServices')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                    style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                  >
                    {t('home.servicesEyebrow')}
                  </p>
                  <h2
                    className="font-black uppercase leading-tight"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {t('home.servicesHeadline')}
                  </h2>
                </div>
                <Link
                  to={localizedPath('/services')}
                  className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-300 group shrink-0"
                  style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white) / 0.5)`;
                  }}
                >
                  {t('home.servicesViewAll')}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
              {featuredServices.map((service, i) => (
                <FadeIn key={service.number} delay={i * 0.07}>
                  <ServiceCard service={service} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SELECTED WORK ────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.selectedWork')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                    style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                  >
                    {t('home.portfolioEyebrow')}
                  </p>
                  <h2
                    className="font-black uppercase leading-tight"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                      color: `hsl(var(--metro-white))`,
                    }}
                  >
                    {t('home.portfolioHeadline')}
                  </h2>
                </div>
                <Link
                  to={localizedPath('/portfolio')}
                  className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-300 group shrink-0"
                  style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white) / 0.5)`;
                  }}
                >
                  {t('home.portfolioViewAll')}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolioItems.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                  <PortfolioCard item={item} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES ───────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.industriesServed')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {t('home.industriesEyebrow')}
              </p>
              <h2
                className="font-black uppercase leading-tight mb-14"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                {t('home.industriesHeadline')}
              </h2>
            </FadeIn>

            <div className="flex flex-wrap gap-3">
              {home.industries.map((industry, i) => (
                <FadeIn key={industry} delay={i * 0.04}>
                  <Link
                    to={localizedPath(industryLinks[i] ?? '/industries')}
                    className="inline-flex items-center px-5 py-2.5 text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
                    style={{
                      border: `1px solid hsl(var(--metro-border-subtle) / 0.15)`,
                      color: `hsl(var(--metro-white) / 0.55)`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-white) / 0.4)`;
                      (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = `hsl(var(--metro-border-subtle) / 0.15)`;
                      (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white) / 0.55)`;
                    }}
                  >
                    {industry}
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPECIALTIES ──────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={portfolioContent.hero.headline}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {portfolioContent.hero.eyebrow}
              </p>
              <h2
                className="font-black uppercase leading-tight mb-12"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                {portfolioContent.hero.headline}
              </h2>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {specialtySlots.map((sp, i) => {
                const label = portfolioContent.categories.find((c) => c.id === sp.id)?.label ?? sp.id;
                return (
                  <FadeIn key={sp.id} delay={i * 0.06}>
                    <Link
                      to={`${localizedPath('/portfolio')}?c=${sp.id}`}
                      className="group relative block overflow-hidden"
                      style={{ aspectRatio: '4/5', background: `hsl(var(--metro-black))` }}
                    >
                      <img
                        src={sp.src}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, hsl(var(--metro-black) / 0.85), transparent 55%)` }}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute bottom-0 left-0 right-0 p-4 font-black uppercase text-xs md:text-sm leading-tight"
                        style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--metro-white))` }}
                      >
                        {label}
                      </span>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: `hsl(var(--metro-charcoal-deep))` }}
          aria-label={t('aria.whyChoose')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <FadeIn>
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                style={{ color: `hsl(var(--metro-white) / 0.35)` }}
              >
                {t('home.whyEyebrow')}
              </p>
              <h2
                className="font-black uppercase leading-tight mb-16"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                  color: `hsl(var(--metro-white))`,
                }}
              >
                {t('home.whyHeadline')}
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: `hsl(var(--metro-border-subtle) / 0.07)` }}>
              {home.differentiators.map((item, i) => (
                <FadeIn key={item.number} delay={i * 0.1}>
                  <div
                    className="p-10 md:p-14 flex gap-8"
                    style={{ background: `hsl(var(--metro-black))` }}
                  >
                    <span
                      className="font-black leading-none shrink-0 select-none"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(3rem, 5vw, 5rem)',
                        color: `hsl(var(--metro-white) / 0.07)`,
                        lineHeight: 1,
                      }}
                    >
                      {item.number}
                    </span>
                    <div>
                      <h3
                        className="font-bold uppercase tracking-wide mb-4"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1rem',
                          color: `hsl(var(--metro-white))`,
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT CTA ──────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: `hsl(var(--metro-black))` }}
          aria-label={t('aria.contactCta')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
            {/* Image side */}
            <div className="relative hidden lg:block">
              <img
                src="/airo-assets/images/pages/home/contact-cta"
                alt={t('aria.altProductionTeam')}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={480}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent 40%, hsl(var(--metro-black)))`,
                }}
                aria-hidden="true"
              />
            </div>

            {/* Text side */}
            <div className="flex flex-col justify-center px-10 md:px-16 py-20">
              <FadeIn>
                <p
                  className="text-xs font-semibold tracking-[0.25em] uppercase mb-6"
                  style={{ color: `hsl(var(--metro-white) / 0.35)` }}
                >
                  {t('home.ctaEyebrow')}
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2
                  className="font-black uppercase leading-tight mb-6"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
                    color: `hsl(var(--metro-white))`,
                  }}
                >
                  {t('home.ctaHeadline')}
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p
                  className="text-base leading-relaxed mb-10"
                  style={{ color: `hsl(var(--metro-white) / 0.5)` }}
                >
                  {t('home.ctaBody')}
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 w-fit group"
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
                  {t('home.ctaButton')}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service }: { service: FeaturedService }) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden group cursor-default"
      style={{
        background: `hsl(var(--metro-black))`,
        transform: hovered ? 'scale(1.015)' : 'scale(1)',
        transition: 'transform 0.4s ease',
        zIndex: hovered ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={service.slot}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          loading="lazy"
          width={600}
          height={338}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-400"
          style={{
            background: `hsl(var(--metro-black) / 0.45)`,
            opacity: hovered ? 0.7 : 0.45,
          }}
          aria-hidden="true"
        />
        <span
          className="absolute top-4 left-4 font-black"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            color: `hsl(var(--metro-white) / 0.15)`,
            lineHeight: 1,
          }}
        >
          {service.number}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="font-bold uppercase tracking-wide mb-3"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.8rem',
            color: `hsl(var(--metro-white))`,
          }}
        >
          {service.title}
        </h3>
        <p
          className="text-xs leading-relaxed mb-5"
          style={{ color: `hsl(var(--metro-white) / 0.5)` }}
        >
          {service.description}
        </p>
        <Link
          to={localizedPath('/services')}
          className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 group"
          style={{ color: `hsl(var(--metro-white) / 0.45)` }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white))`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = `hsl(var(--metro-white) / 0.45)`;
          }}
        >
          {t('common.learnMore')}
          <ArrowRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────
function PortfolioCard({ item }: { item: PortfolioPreview }) {
  const localizedPath = useLocalizedPath();
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={localizedPath('/portfolio')}
      className="relative block overflow-hidden aspect-[4/3]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={item.slot}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        loading="lazy"
        width={600}
        height={450}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400"
        style={{
          background: `linear-gradient(to top, hsl(var(--metro-black) / 0.85) 0%, transparent 55%)`,
          opacity: hovered ? 1 : 0.75,
        }}
        aria-hidden="true"
      />
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase mb-1.5"
          style={{ color: `hsl(var(--metro-white) / 0.5)` }}
        >
          {item.category}
        </p>
        <p
          className="font-bold uppercase tracking-wide"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            color: `hsl(var(--metro-white))`,
          }}
        >
          {item.title}
        </p>
      </div>
    </Link>
  );
}
