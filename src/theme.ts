/**
 * Design system — mirrors the svfs-fe web app token set (shadcn + Tailwind, hue 215 blue).
 * oklch values from index.css converted to sRGB hex.
 * All screens and components should source colors, typography, spacing, and radii from here.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Semantic roles  (maps to web --primary, --background, etc.)
  primary:           '#2563eb',   // oklch(0.45 0.14 215) — blue-600
  primaryFg:         '#ffffff',   // oklch(1 0 0)
  primaryLight:      '#eff6ff',   // blue-50
  primaryMuted:      '#dbeafe',   // blue-100

  secondary:         '#e2e8f0',   // oklch(0.91 0.04 215) — slate-200
  secondaryFg:       '#2563eb',

  background:        '#f1f5f9',   // oklch(0.97 0.008 215) — slate-50
  card:              '#ffffff',   // oklch(1 0 0)
  cardFg:            '#0f172a',   // oklch(0.15 0.025 215) — slate-900

  muted:             '#f1f5f9',   // oklch(0.95 0.008 215) — slate-50
  mutedFg:           '#64748b',   // oklch(0.50 0.02 215)  — slate-500

  accent:            '#ccfbf1',   // oklch(0.88 0.055 185) — teal-100
  accentFg:          '#134e4a',   // oklch(0.25 0.05 185)  — teal-900

  border:            '#e2e8f0',   // oklch(0.87 0.018 215) — slate-200
  input:             '#e2e8f0',
  ring:              '#2563eb',

  foreground:        '#0f172a',   // oklch(0.15 0.025 215) — slate-900
  subtleFg:          '#94a3b8',   // slate-400

  destructive:       '#ef4444',   // oklch(0.577 0.245 27) — red-500
  destructiveFg:     '#ffffff',

  success:           '#10b981',   // emerald-500
  warning:           '#f59e0b',   // amber-500

  // ─── Booking status ─────────────────────────────────────────────────────────
  status: {
    CREATED:            { label: 'Booked',           bg: '#ede9fe', text: '#6d28d9', accent: '#6366f1' },   // indigo
    IN_TRANSIT:         { label: 'In Transit',       bg: '#fef9c3', text: '#92400e', accent: '#f59e0b' },   // amber
    RECEIVED_AT_BRANCH: { label: 'At Branch',        bg: '#f3e8ff', text: '#7c3aed', accent: '#8b5cf6' },   // violet
    OUT_FOR_DELIVERY:   { label: 'Out for Delivery', bg: '#dbeafe', text: '#1d4ed8', accent: '#3b82f6' },   // blue
    DELIVERED:          { label: 'Delivered',        bg: '#d1fae5', text: '#065f46', accent: '#10b981' },   // emerald
    CANCELLED:          { label: 'Cancelled',        bg: '#fee2e2', text: '#dc2626', accent: '#ef4444' },   // red
  },

  // ─── Booking type ────────────────────────────────────────────────────────────
  // Colors mirror the web app (svfs-FE BookingFormPage) Tailwind tokens
  bookingType: {
    PAID:   { bg: '#d1fae5', border: '#6ee7b7', text: '#047857', accent: '#059669' },  // emerald-100/300/700/600
    TO_PAY: { bg: '#fef3c7', border: '#fcd34d', text: '#b45309', accent: '#d97706' },  // amber-100/300/700/600
    TBB:    { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', accent: '#2563eb' },  // blue-100/300/700/600
    FOC:    { bg: '#e2e8f0', border: '#cbd5e1', text: '#475569', accent: '#64748b' },  // slate-200/300/600/500
  },
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  size: {
    xs:   10,
    sm:   12,
    base: 14,
    md:   15,
    lg:   16,
    xl:   18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
  },
  weight: {
    normal:    '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────
// 4-point grid — mirrors Tailwind's default scale

export const spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const

// ─── Border radius ────────────────────────────────────────────────────────────
// Base radius = 0.625rem (10px) from web --radius

export const radius = {
  sm:   6,    // --radius-sm  (radius - 4)
  md:   8,    // --radius-md  (radius - 2)
  DEFAULT: 10, // --radius
  lg:   10,   // --radius-lg  (= radius)
  xl:   14,   // --radius-xl  (radius + 4)
  '2xl': 18,  // --radius-2xl (radius + 8)
  '3xl': 22,  // --radius-3xl (radius + 12)
  '4xl': 26,  // --radius-4xl (radius + 16)
  full: 9999,
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  }),
} as const
