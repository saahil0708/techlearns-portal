/**
 * TechLearns Brand Color System
 * Primary: Navy (#0B1F3A)
 * Secondary / Accent: Purple (#5B2D90)
 */

export const BRAND_COLORS = {
  // Core Brand Tokens
  primary: '#0B1F3A',
  secondary: '#5B2D90',
  accent: '#5B2D90',

  // Named Semantics
  navy: {
    50: '#F0F4FA',
    100: '#E1E9F5',
    200: '#C2D3EB',
    300: '#94B2DC',
    400: '#5E8AC7',
    500: '#3969B0',
    600: '#234C8F',
    700: '#17366E',
    800: '#0F264F',
    900: '#0B1F3A', // Primary Brand Navy
    DEFAULT: '#0B1F3A',
    hover: '#132C52',
    active: '#08172D',
  },

  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#9B45E4',
    600: '#7E30BA',
    700: '#5B2D90', // Secondary Brand Purple / Accent
    800: '#4A2377',
    900: '#381A5B',
    DEFAULT: '#5B2D90',
    hover: '#6D36AC',
    active: '#4A2377',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #0B1F3A 0%, #17366E 100%)',
    secondary: 'linear-gradient(135deg, #5B2D90 0%, #7E30BA 100%)',
    brand: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
    brandReverse: 'linear-gradient(135deg, #5B2D90 0%, #0B1F3A 100%)',
    subtleNavy: 'linear-gradient(135deg, rgba(11, 31, 58, 0.08) 0%, rgba(11, 31, 58, 0.02) 100%)',
    subtlePurple: 'linear-gradient(135deg, rgba(91, 45, 144, 0.08) 0%, rgba(91, 45, 144, 0.02) 100%)',
    hero: 'linear-gradient(135deg, #0B1F3A 0%, #201335 50%, #5B2D90 100%)',
  },

  // Alpha / Tints
  alpha: {
    navy5: 'rgba(11, 31, 58, 0.05)',
    navy10: 'rgba(11, 31, 58, 0.1)',
    navy15: 'rgba(11, 31, 58, 0.15)',
    navy20: 'rgba(11, 31, 58, 0.2)',
    purple5: 'rgba(91, 45, 144, 0.05)',
    purple10: 'rgba(91, 45, 144, 0.1)',
    purple15: 'rgba(91, 45, 144, 0.15)',
    purple20: 'rgba(91, 45, 144, 0.2)',
  },
} as const;

export default BRAND_COLORS;
