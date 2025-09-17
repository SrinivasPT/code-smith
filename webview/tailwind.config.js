module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary: subtle blue accents
        primary: {
          50: '#f0f7ff',
          100: '#ddefff',
          200: '#c5e6ff',
          300: '#9fd6ff',
          400: '#6fbff7',
          500: '#4aa3e8',
          600: '#2f85c8',
          700: '#276aa7',
          800: '#1f4f86',
          900: '#183b67',
        },
        // Secondary: light/silver palette (note: higher numbers intentionally map to lighter shades so existing class usage maps to light backgrounds)
        secondary: {
          50: '#111827',
          100: '#374151',
          200: '#4b5563',
          300: '#6b7280',
          400: '#9ca3af',
          500: '#d1d5db',
          600: '#e5e7eb',
          700: '#f3f4f6',
          800: '#ffffff',
          900: '#ffffff',
        },
        // Accent: subtle muted gray for badges and small highlights
        accent: {
          50: '#fafafa',
          100: '#f5f5f7',
          200: '#eaebed',
          300: '#dcdde0',
          400: '#c8c9cc',
          500: '#b0b2b6',
          600: '#8f9094',
          700: '#6e6f73',
          800: '#4d4e51',
          900: '#2b2b2d',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
    },
  },
  plugins: [],
};
