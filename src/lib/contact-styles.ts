import type React from 'react';

/** Shared CSS for contact form field labels — purely presentational, no user-visible text */
export const fieldLabelCss: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'hsl(var(--metro-white) / 0.45)',
  marginBottom: '8px',
  fontFamily: 'var(--font-heading)',
};

/** Shared base CSS for contact form inputs */
export const inputBase: React.CSSProperties = {
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
