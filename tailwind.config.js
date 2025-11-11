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
        // T1 Brand Colors
        't1-red': '#db3b2b',
        't1-blue': '#009AD9',
        't1-telmex': '#005A8B',
        't1-telnor': '#00A650',
        
        // Custom colors for your project
        'primary': '#db3b2b',
        'secondary': '#009AD9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        muli: ['Muli', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        't1': '0 10px 30px rgba(0, 0, 0, 0.1)',
        't1-hover': '0 15px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        
        // Custom breakpoints for T1 project
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1440px',
        
        // Height-based media queries
        'short': { 'raw': '(max-height: 667px)' },
        'tall': { 'raw': '(min-height: 768px)' },
      },
    },
  },
  plugins: [
    // Add any Tailwind plugins you want
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
  ],
}
