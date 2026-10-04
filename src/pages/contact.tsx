import { openChat } from '../components/chat/openChat';
import { useState, type FormEvent, useRef } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { useTranslation } from 'react-i18next';
import useLocalizedPath from '../hooks/useLocalizedPath';
import { getPageSeo, getCanonicalUrl, SITE_URL, OG_IMAGE } from '@/lib/seo-meta';
import { buildHreflangLinks } from '@/lib/hreflang';

import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useLocalizedContent } from '@/lib/i18n/content';

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

// ─── Form status type ─────────────────────────────────────────────────────────
type FormStatus = 'idle' | 'sending' | 'success' | 'error';

// Returns base input CSS — purely presentational, no user-visible text
function baseInputCss(): React.CSSProperties {
  return {
    width: '100%',
    background: 'hsl(var(--metro-charcoal-deep))',
    color: 'hsl(var(--metro-white))',
    border: '1px solid hsl(var(--metro-white) / 0.12)',
    outline: 'none',
    padding: '14px 16px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s ease',
  };
}

// Returns label CSS — purely presentational, no user-visible text
function labelCss(): React.CSSProperties {
  return {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'hsl(var(--metro-white) / 0.45)',
    marginBottom: '8px',
    fontFamily: 'var(--font-heading)',
  };
}

export default function ContactPage() {
  const contact = useLocalizedContent('contact');
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const seo = getPageSeo('contact', lang);
  const canonicalUrl = getCanonicalUrl('contact', lang);
  const localizedPath = useLocalizedPath();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${canonicalUrl}#webpage`,
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  };

  const fieldStyle = (name: string): React.CSSProperties => ({
    ...baseInputCss(),
    borderColor: focusedField === name
      ? 'hsl(var(--metro-white) / 0.5)'
      : 'hsl(var(--metro-white) / 0.12)',
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    // Required fields are checked in the browser first: nothing is sent while they are empty or malformed.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);

    // Honeypot check — bail silently if filled by a bot
    if (formData.get('_gotcha')) return;

    const name = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const company = String(formData.get('company') ?? '').trim();
    const service = String(formData.get('service') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const budget = String(formData.get('budget') ?? '').trim();
    const preferredContact = String(formData.get('preferredContact') ?? '').trim();
    const privacy = formData.get('privacy') === 'on' ? 'Yes' : 'No';

    setStatus('sending');
    setErrorMsg('');

    // Submission timestamp and active language
    const submittedAt = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Dubai',
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }) + ' (GST / Dubai)';
    const selectedLanguage = window.location.pathname.split('/')[1]?.toUpperCase() || 'EN';

    // Formatted message body — appears as the main email body in the inbox thread
    const formattedBody = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'NEW PROJECT INQUIRY',
      'Metropolitan Digital Marketing',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `Full Name:               ${name}`,
      `Company Name:            ${company || 'Not provided'}`,
      `Email Address:           ${email}`,
      `Phone Number:            ${phone || 'Not provided'}`,
      '',
      `Service Required:        ${service || 'Not specified'}`,
      `Estimated Budget:        ${budget || 'Not provided'}`,
      `Preferred Contact:       ${preferredContact || 'Not specified'}`,
      '',
      'Project Description:',
      description || 'No description provided.',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Submission Date/Time:    ${submittedAt}`,
      `Website Language:        ${selectedLanguage}`,
      `Privacy Consent:         ${privacy}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ].join('\n');

    try {
      // Field mapping: only the formatted body goes in messages_attributes[0].body.
      // All other fields are added to conversation.data as { "Label": value } pairs
      // so they appear as structured metadata in the Inbox thread.
      const res = await fetch('/api/contact/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            messages_attributes: [{ body: formattedBody }],
            data: {
              __gd_contact_form_title: `NEW PROJECT INQUIRY — METROPOLITAN DIGITAL MARKETING — ${service || 'General Inquiry'}`,
              'Full Name': name,
              'Company Name': company || 'Not provided',
              'Email Address': email,
              'Phone Number': phone || 'Not provided',
              'Service Required': service || 'Not specified',
              'Estimated Budget': budget || 'Not provided',
              'Preferred Contact Method': preferredContact || 'Not specified',
              'Privacy Consent': privacy,
              'Submission Date/Time': submittedAt,
              'Website Language': selectedLanguage,
            },
          },
          user: { email, name },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatus('success');
        form.reset();
      } else {
        throw new Error(json.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        {buildHreflangLinks('/contact').map(({ hreflang, href }) => (
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

      {/* ── FLOATING WHATSAPP BUTTON ─────────────────────────────────────── */}
      <a
        href={contact.methods.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300"
        style={{
          background: 'hsl(var(--metro-whatsapp))',
          color: 'hsl(var(--metro-white))',
          boxShadow: '0 4px 24px hsl(var(--metro-whatsapp) / 0.35)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-whatsapp-dark))';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-whatsapp))';
        }}
        aria-label={t('aria.chatOnWhatsApp')}
      >
        <MessageCircle size={16} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden flex items-end"
          style={{ minHeight: '56vh', background: 'hsl(var(--metro-black))' }}
          aria-label={t('aria.contactHero')}
        >
          <img
            src="/airo-assets/images/pages/home/contact-cta"
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
            style={{ background: 'hsl(var(--metro-black) / 0.72)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--metro-black)))' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-20 pt-44 w-full">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
              className="text-xs font-semibold tracking-[0.3em] uppercase mb-5"
              style={{ color: 'hsl(var(--metro-white) / 0.4)' }}
            >
              {contact.hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: 'easeOut' as const }}
              className="font-black uppercase leading-none mb-5"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.2rem, 5.5vw, 5.5rem)',
                color: 'hsl(var(--metro-white))',
                letterSpacing: '-0.02em',
                maxWidth: '900px',
              }}
            >
              {contact.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' as const }}
              className="text-sm leading-relaxed"
              style={{ color: 'hsl(var(--metro-white) / 0.5)', maxWidth: '520px' }}
            >
              {contact.hero.subheadline}
            </motion.p>
          </div>
        </section>

        {/* ── CONTACT METHODS STRIP ────────────────────────────────────────── */}
        <div
          style={{
            background: 'hsl(var(--metro-charcoal-deep))',
            borderBottom: '1px solid hsl(var(--metro-white) / 0.07)',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ background: 'hsl(var(--metro-white) / 0.07)' }}
            >

              {/* WhatsApp */}
              <a
                href={contact.methods.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-6 transition-all duration-250"
                style={{ background: 'hsl(var(--metro-charcoal-deep))' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal-deep))';
                }}
              >
                <div
                  className="shrink-0 p-2.5 mt-0.5"
                  style={{
                    background: 'hsl(var(--metro-whatsapp) / 0.12)',
                    border: '1px solid hsl(var(--metro-whatsapp) / 0.25)',
                  }}
                >
                  <MessageCircle size={16} style={{ color: 'hsl(var(--metro-whatsapp-light))' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.16em] uppercase mb-1"
                    style={{ color: 'hsl(var(--metro-white) / 0.4)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.methods.whatsapp.label}
                  </p>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                    {contact.methods.whatsapp.number}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                    {contact.methods.whatsapp.description}
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href={contact.methods.phone.href}
                className="flex items-start gap-4 p-6 transition-all duration-250"
                style={{ background: 'hsl(var(--metro-charcoal-deep))' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal-deep))';
                }}
              >
                <div
                  className="shrink-0 p-2.5 mt-0.5"
                  style={{
                    background: 'hsl(var(--metro-white) / 0.05)',
                    border: '1px solid hsl(var(--metro-white) / 0.12)',
                  }}
                >
                  <Phone size={16} style={{ color: 'hsl(var(--metro-white) / 0.7)' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.16em] uppercase mb-1"
                    style={{ color: 'hsl(var(--metro-white) / 0.4)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.methods.phone.label}
                  </p>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                    {contact.methods.phone.number}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                    {contact.methods.phone.description}
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href={contact.methods.email.href}
                className="flex items-start gap-4 p-6 transition-all duration-250"
                style={{ background: 'hsl(var(--metro-charcoal-deep))' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-charcoal-deep))';
                }}
              >
                <div
                  className="shrink-0 p-2.5 mt-0.5"
                  style={{
                    background: 'hsl(var(--metro-white) / 0.05)',
                    border: '1px solid hsl(var(--metro-white) / 0.12)',
                  }}
                >
                  <Mail size={16} style={{ color: 'hsl(var(--metro-white) / 0.7)' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.16em] uppercase mb-1"
                    style={{ color: 'hsl(var(--metro-white) / 0.4)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.methods.email.label}
                  </p>
                  <p className="text-sm font-semibold mb-1 break-all" style={{ color: 'hsl(var(--metro-white))' }}>
                    {contact.methods.email.address}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                    {contact.methods.email.description}
                  </p>
                </div>
              </a>

              {/* Location */}
              <div
                className="flex items-start gap-4 p-6"
                style={{ background: 'hsl(var(--metro-charcoal-deep))' }}
              >
                <div
                  className="shrink-0 p-2.5 mt-0.5"
                  style={{
                    background: 'hsl(var(--metro-white) / 0.05)',
                    border: '1px solid hsl(var(--metro-white) / 0.12)',
                  }}
                >
                  <MapPin size={16} style={{ color: 'hsl(var(--metro-white) / 0.7)' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.16em] uppercase mb-1"
                    style={{ color: 'hsl(var(--metro-white) / 0.4)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.location.label}
                  </p>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                    <span>{contact.location.city}</span>
                    <span>, </span>
                    <span>{contact.location.country}</span>
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                    {contact.location.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mt-6">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: '40px', height: '40px', border: '1px solid hsl(var(--metro-white) / 0.12)' }}
                >
                  <Clock size={16} style={{ color: 'hsl(var(--metro-white) / 0.7)' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold tracking-[0.16em] uppercase mb-1"
                    style={{ color: 'hsl(var(--metro-white) / 0.4)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.hours.label}
                  </p>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                    {contact.hours.days} · {contact.hours.time}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                    {contact.hours.closed}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── FORM + SIDEBAR ───────────────────────────────────────────────── */}
        <section
          className="py-xxl"
          style={{ background: 'hsl(var(--metro-black))' }}
          aria-label={t('aria.contactForm')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 xl:gap-24">

              {/* ── FORM COLUMN ─────────────────────────────────────────── */}
              <div>
                <FadeIn>
                  <div className="flex items-start justify-between gap-4 mb-4">
                  <p
                    className="text-xs font-semibold tracking-[0.28em] uppercase"
                    style={{ color: 'hsl(var(--metro-white) / 0.35)', fontFamily: 'var(--font-heading)' }}
                  >
                    {contact.methods.form.eyebrow}
                  </p>
                  <button
                    type="button"
                    onClick={openChat}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300"
                    style={{ border: '1px solid hsl(var(--metro-white) / 0.5)', color: 'hsl(var(--metro-white))' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--metro-white))'; (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--metro-black))'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--metro-white))'; }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: '#4ade80' }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#4ade80' }} />
                    </span>
                    {t('nav.chat')}
                  </button>
                  </div>
                  <h2
                    className="font-black uppercase leading-tight mb-3"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.6rem, 3vw, 2.8rem)',
                      color: 'hsl(var(--metro-white))',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {contact.methods.form.headline}
                  </h2>
                  <p
                    className="text-sm leading-relaxed mb-10"
                    style={{ color: 'hsl(var(--metro-white) / 0.45)', maxWidth: '480px' }}
                  >
                    {contact.methods.form.body}
                  </p>
                </FadeIn>

                {/* ── SUCCESS STATE ──────────────────────────────────── */}
                {status === 'success' ? (
                  <FadeIn>
                    <div
                      className="p-10 flex flex-col items-start gap-5"
                      style={{
                        background: 'hsl(var(--metro-charcoal-deep))',
                        border: '1px solid hsl(var(--metro-white) / 0.1)',
                      }}
                    >
                      <CheckCircle2 size={36} style={{ color: 'hsl(var(--metro-whatsapp-light))' }} />
                      <div>
                        <h3
                          className="font-black uppercase text-xl mb-3"
                          style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--metro-white))' }}
                        >
                          {contact.success.headline}
                        </h3>
                        <p
                          className="text-sm leading-relaxed mb-6"
                          style={{ color: 'hsl(var(--metro-white) / 0.5)', maxWidth: '440px' }}
                        >
                          {contact.success.body}
                        </p>
                        <a
                          href={contact.methods.whatsapp.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-250"
                          style={{
                            background: 'hsl(var(--metro-whatsapp))',
                            color: 'hsl(var(--metro-white))',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-whatsapp-dark))';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--metro-whatsapp))';
                          }}
                        >
                          <MessageCircle size={14} />
                          {contact.success.whatsappLabel}
                        </a>
                      </div>
                    </div>
                  </FadeIn>
                ) : (
                  /* ── FORM ──────────────────────────────────────────── */
                  <FadeIn delay={0.1}>
                    <form onSubmit={handleSubmit} noValidate>
                      {/* Honeypot — never sent in POST body */}
                      <input
                        type="text"
                        name="_gotcha"
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ position: 'absolute', width: 1, height: 1, padding: 0, border: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', opacity: 0, pointerEvents: 'none' }}
                        aria-hidden="true"
                      />

                      {/* Row 1: Full Name + Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label htmlFor="fullName" style={labelCss()}>
                            {t('contact.fieldFullName')} <span style={{ color: 'hsl(var(--metro-white) / 0.6)' }}>*</span>
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            placeholder={t('contact.fieldFullName')}
                            style={fieldStyle('fullName')}
                            onFocus={() => setFocusedField('fullName')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                        <div>
                          <label htmlFor="company" style={labelCss()}>
                            {t('contact.fieldCompanyName')}
                          </label>
                          <input
                            id="company"
                            name="company"
                            type="text"
                            placeholder={t('contact.fieldCompanyName')}
                            style={fieldStyle('company')}
                            onFocus={() => setFocusedField('company')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                      </div>

                      {/* Row 2: Email + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label htmlFor="email" style={labelCss()}>
                            {t('contact.fieldEmail')} <span style={{ color: 'hsl(var(--metro-white) / 0.6)' }}>*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            style={fieldStyle('email')}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" style={labelCss()}>
                            {t('contact.fieldPhone')} <span style={{ color: 'hsl(var(--metro-white) / 0.6)' }}>*</span>
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            placeholder="+971 XX XXX XXXX"
                            style={fieldStyle('phone')}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                      </div>

                      {/* Service Required */}
                      <div className="mb-5">
                        <label htmlFor="service" style={labelCss()}>
                          {t('contact.fieldService')} <span style={{ color: 'hsl(var(--metro-white) / 0.6)' }}>*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="service"
                            name="service"
                            required
                            defaultValue=""
                            style={{ ...fieldStyle('service'), appearance: 'none', cursor: 'pointer' }}
                            onFocus={() => setFocusedField('service')}
                            onBlur={() => setFocusedField(null)}
                          >
                            <option value="" disabled style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                              {t('contact.fieldServicePlaceholder')}
                            </option>
                            {contact.services.map((s) => (
                              <option key={s.id} value={s.label} style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: 'hsl(var(--metro-white) / 0.4)' }}
                          />
                        </div>
                      </div>

                      {/* Project Description */}
                      <div className="mb-5">
                        <label htmlFor="description" style={labelCss()}>
                          {t('contact.fieldDescription')} <span style={{ color: 'hsl(var(--metro-white) / 0.6)' }}>*</span>
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          required
                          rows={5}
                          placeholder={t('contact.fieldDescriptionPlaceholder')}
                          style={{ ...fieldStyle('description'), resize: 'vertical', minHeight: '120px' }}
                          onFocus={() => setFocusedField('description')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>

                      {/* Budget + Preferred Contact */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        <div>
                          <label htmlFor="budget" style={labelCss()}>
                            {t('contact.fieldBudget')}
                          </label>
                          <div className="relative">
                            <select
                              id="budget"
                              name="budget"
                              defaultValue=""
                              style={{ ...fieldStyle('budget'), appearance: 'none', cursor: 'pointer' }}
                              onFocus={() => setFocusedField('budget')}
                              onBlur={() => setFocusedField(null)}
                            >
                              <option value="" style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                                {t('contact.fieldBudgetPlaceholder')}
                              </option>
                              {contact.budgets.map((b) => (
                                <option key={b.id} value={b.label} style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                                  {b.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: 'hsl(var(--metro-white) / 0.4)' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="preferredContact" style={labelCss()}>
                            {t('contact.fieldContactMethod')}
                          </label>
                          <div className="relative">
                            <select
                              id="preferredContact"
                              name="preferredContact"
                              defaultValue=""
                              style={{ ...fieldStyle('preferredContact'), appearance: 'none', cursor: 'pointer' }}
                              onFocus={() => setFocusedField('preferredContact')}
                              onBlur={() => setFocusedField(null)}
                            >
                              <option value="" style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                                {t('contact.fieldContactMethodPlaceholder')}
                              </option>
                              {contact.contactMethods.map((cm) => (
                                <option key={cm.id} value={cm.label} style={{ background: 'hsl(var(--metro-charcoal-deep))' }}>
                                  {cm.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: 'hsl(var(--metro-white) / 0.4)' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Privacy Consent */}
                      <div className="mb-8">
                        <label className="flex items-start gap-3 cursor-pointer" htmlFor="privacy">
                          <input
                            id="privacy"
                            name="privacy"
                            type="checkbox"
                            required
                            className="mt-0.5 shrink-0"
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: 'hsl(var(--metro-white))',
                              cursor: 'pointer',
                            }}
                          />
                          <span className="text-xs leading-relaxed" style={{ color: 'hsl(var(--metro-white) / 0.45)' }}>
                            {contact.privacy.text}
                          </span>
                        </label>
                        <p className="text-xs mt-2 ml-7" style={{ color: 'hsl(var(--metro-white) / 0.25)' }}>
                          {contact.privacy.note}
                        </p>
                      </div>

                      {/* Error message */}
                      {status === 'error' && (
                        <p
                          className="text-xs mb-5 px-4 py-3"
                          role="alert"
                          style={{
                            color: 'hsl(var(--metro-error))',
                            background: 'hsl(var(--metro-error) / 0.08)',
                            border: '1px solid hsl(var(--metro-error) / 0.2)',
                          }}
                        >
                          {errorMsg}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: 'hsl(var(--metro-white))',
                          color: 'hsl(var(--metro-black))',
                        }}
                        onMouseEnter={(e) => {
                          if (status !== 'sending') {
                            (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--metro-white) / 0.88)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--metro-white))';
                        }}
                      >
                        {status === 'sending' ? t('contact.submitting') : t('contact.submitButton')}
                        {status !== 'sending' && (
                          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                        )}
                      </button>
                    </form>
                  </FadeIn>
                )}
              </div>

              {/* ── SIDEBAR ─────────────────────────────────────────────── */}
              <aside>
                <FadeIn delay={0.15}>

                  {/* Quick contact card */}
                  <div
                    className="p-7 mb-6"
                    style={{
                      background: 'hsl(var(--metro-charcoal-deep))',
                      border: '1px solid hsl(var(--metro-white) / 0.08)',
                    }}
                  >
                    <p
                      className="text-xs font-semibold tracking-[0.2em] uppercase mb-5"
                      style={{ color: 'hsl(var(--metro-white) / 0.35)', fontFamily: 'var(--font-heading)' }}
                    >
                      {t('ui.quickContact')}
                    </p>

                    <a
                      href={contact.methods.whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 py-3 transition-opacity duration-200 hover:opacity-70 border-b"
                      style={{ borderColor: 'hsl(var(--metro-white) / 0.07)' }}
                    >
                      <MessageCircle size={15} style={{ color: 'hsl(var(--metro-whatsapp-light))', flexShrink: 0 }} />
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>WhatsApp</p>
                        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--metro-white))' }}>
                          {contact.methods.whatsapp.number}
                        </p>
                      </div>
                    </a>

                    <a
                      href={contact.methods.phone.href}
                      className="flex items-center gap-3 py-3 transition-opacity duration-200 hover:opacity-70 border-b"
                      style={{ borderColor: 'hsl(var(--metro-white) / 0.07)' }}
                    >
                      <Phone size={15} style={{ color: 'hsl(var(--metro-white) / 0.5)', flexShrink: 0 }} />
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>{t('ui.phone')}</p>
                        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--metro-white))' }}>
                          {contact.methods.phone.number}
                        </p>
                      </div>
                    </a>

                    <a
                      href={contact.methods.email.href}
                      className="flex items-center gap-3 py-3 transition-opacity duration-200 hover:opacity-70"
                    >
                      <Mail size={15} style={{ color: 'hsl(var(--metro-white) / 0.5)', flexShrink: 0 }} />
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>{t('ui.email')}</p>
                        <p className="text-sm font-semibold break-all" style={{ color: 'hsl(var(--metro-white))' }}>
                          {contact.methods.email.address}
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Location card */}
                  <div
                    className="p-7 mb-6"
                    style={{
                      background: 'hsl(var(--metro-charcoal-deep))',
                      border: '1px solid hsl(var(--metro-white) / 0.08)',
                    }}
                  >
                    <p
                      className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
                      style={{ color: 'hsl(var(--metro-white) / 0.35)', fontFamily: 'var(--font-heading)' }}
                    >
                      {t('ui.basedIn')}
                    </p>
                    <div className="flex items-start gap-3">
                      <MapPin size={15} style={{ color: 'hsl(var(--metro-white) / 0.5)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                          <span>{contact.location.city}</span>
                          <span>, </span>
                          <span>{contact.location.country}</span>
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                          {contact.location.detail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                      <Clock size={15} style={{ color: 'hsl(var(--metro-white) / 0.5)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--metro-white))' }}>
                          {contact.hours.days} · {contact.hours.time}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--metro-white) / 0.35)' }}>
                          {contact.hours.closed}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div
                    className="p-7"
                    style={{
                      background: 'hsl(var(--metro-charcoal-deep))',
                      border: '1px solid hsl(var(--metro-white) / 0.08)',
                    }}
                  >
                    <p
                      className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
                      style={{ color: 'hsl(var(--metro-white) / 0.35)', fontFamily: 'var(--font-heading)' }}
                    >
                      {t('ui.followUs')}
                    </p>
                    <a
                      href={contact.social.instagram.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity duration-200 hover:opacity-70"
                      style={{ color: 'hsl(var(--metro-white))' }}
                    >
                      <Instagram size={16} />
                      {contact.social.instagram.label}
                    </a>
                  </div>

                </FadeIn>
              </aside>

            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer
          className="py-8"
          style={{
            background: 'hsl(var(--metro-charcoal-deep))',
            borderTop: '1px solid hsl(var(--metro-white) / 0.07)',
          }}
          aria-label={t('aria.contactFooter')}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-xs font-semibold tracking-[0.14em] uppercase"
              style={{ color: 'hsl(var(--metro-white) / 0.25)', fontFamily: 'var(--font-heading)' }}
            >
              {contact.footer.copyright}
            </p>
            <nav aria-label={t('ui.footerQuickLinks')} className="flex items-center gap-6">
              <Link
                to={localizedPath('/')}
                className="text-xs transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'hsl(var(--metro-white) / 0.35)' }}
              >
                {t('nav.home')}
              </Link>
              <Link
                to={localizedPath('/services')}
                className="text-xs transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'hsl(var(--metro-white) / 0.35)' }}
              >
                {t('nav.services')}
              </Link>
              <Link
                to={localizedPath('/portfolio')}
                className="text-xs transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'hsl(var(--metro-white) / 0.35)' }}
              >
                {t('nav.portfolio')}
              </Link>
            </nav>
          </div>
        </footer>

      </main>
    </>
  );
}
