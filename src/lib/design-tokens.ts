/**
 * Design System Tokens
 *
 * IMPORTANT: The source of truth for color values is src/app/globals.css
 * These TypeScript definitions are for:
 * - Documentation
 * - Type-safe access in component logic
 * - Exporting to design tools
 *
 * CSS Variable References:
 * - To change accent color globally: edit --color-accent-primary in globals.css
 * - To change error color globally: edit --color-error-red in globals.css
 * - To change success color globally: edit --color-success-green in globals.css
 *
 * These values MUST match what's in globals.css :root section
 */

export const designTokens = {
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
  },

  radius: {
    xs: '0px',
    sm: '1px',
    md: '2px',
    lg: '4px',
    xl: '6px',
  },

  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },

  lineHeight: {
    tight: '1.3',
    normal: '1.5',
    relaxed: '1.75',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  colors: {
    accent: 'oklch(0.5265 0.2467 270 / 80.83%)',      // Bluish purple
    destructive: 'oklch(0.577 0.245 27.325)',          // Red (error state)
    success: 'oklch(0.6 0.15 145)',                    // Green (success state)
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type DesignTokens = typeof designTokens;
