/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm dark color system
        'bg-primary': '#0f1419',        // Warm dark charcoal background
        'bg-card': '#2d3748',           // Card background (top of gradient)
        'bg-card-dark': '#1a202c',      // Card background (bottom of gradient)
        'accent-primary': '#ff8a50',    // Warm coral-orange for CTAs
        'accent-secondary': '#4299e1',  // Trustworthy blue for secondary actions
        'success': '#48bb78',           // Success/positive ROI color
        'text-primary': '#f7fafc',      // Warm white for headlines
        'text-secondary': '#e2e8f0',    // Readable gray for body text
        'text-muted': '#a0aec0',        // Subtle information text
        
        // Legacy mappings for backwards compatibility
        'navy-dark': '#0f1419',
        'navy-card': '#2d3748',
        'prospera-orange': '#ff8a50',
        'border-dark': 'rgba(255, 255, 255, 0.08)',
        
        // Original colors mapped to new system
        'fracta-blue': '#4299e1',
        'fracta-green': '#48bb78',
        'prospera-gold': '#ff8a50',
        
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #2d3748 100%)',
        'gradient-card': 'linear-gradient(145deg, #2d3748 0%, #1a202c 100%)',
        'gradient-primary': 'linear-gradient(135deg, #ff8a50 0%, #ed8936 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        'gradient-overlay': 'radial-gradient(circle at 30% 20%, rgba(255, 138, 80, 0.1) 0%, transparent 50%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(255, 138, 80, 0.3)',
        'button': '0 4px 14px 0 rgba(255, 138, 80, 0.39)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
} 