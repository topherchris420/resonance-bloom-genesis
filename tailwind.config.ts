import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// System Colors
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				
				// Void & Quantum Field
				void: 'hsl(var(--void))',
				'void-glow': 'hsl(var(--void-glow))',
				'quantum-field': 'hsl(var(--quantum-field))',
				
				// Resonance Spectrum
				resonance: {
					alpha: 'hsl(var(--resonance-alpha))',
					beta: 'hsl(var(--resonance-beta))',
					gamma: 'hsl(var(--resonance-gamma))',
					delta: 'hsl(var(--resonance-delta))',
					epsilon: 'hsl(var(--resonance-epsilon))',
					omega: 'hsl(var(--resonance-omega))'
				},
				
				// Phase States
				emergence: 'hsl(var(--emergence))',
				coherence: 'hsl(var(--coherence))',
				'phase-lock': 'hsl(var(--phase-lock))',
				harmonic: 'hsl(var(--harmonic))'
			},
			backgroundImage: {
				'cymatic-primary': 'var(--cymatic-primary)',
				'cymatic-harmonic': 'var(--cymatic-harmonic)',
				'field-gradient': 'var(--field-gradient)'
			},
			boxShadow: {
				'resonance': 'var(--shadow-resonance)',
				'emergence': 'var(--shadow-emergence)',
				'phase-lock': 'var(--shadow-phase-lock)'
			},
			transitionProperty: {
				'emergence': 'var(--transition-emergence)',
				'phase': 'var(--transition-phase)',
				'harmonic': 'var(--transition-harmonic)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				// Resonance & Emergence Animations
				'pulse-resonance': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
					'50%': { transform: 'scale(1.05)', opacity: '1' }
				},
				'cymatic-formation': {
					'0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
					'50%': { transform: 'scale(0.8) rotate(180deg)', opacity: '0.7' },
					'100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' }
				},
				'frequency-wave': {
					'0%': { transform: 'translateX(-100%) scaleY(1)' },
					'50%': { transform: 'translateX(0%) scaleY(1.5)' },
					'100%': { transform: 'translateX(100%) scaleY(1)' }
				},
				'emergence': {
					'0%': { opacity: '0', transform: 'scale(0.8) rotate(-10deg)' },
					'100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' }
				},
				'phase-shift': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'25%': { transform: 'rotate(90deg) scale(1.1)' },
					'50%': { transform: 'rotate(180deg) scale(0.9)' },
					'75%': { transform: 'rotate(270deg) scale(1.1)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				'harmonic-glow': {
					'0%, 100%': { filter: 'brightness(1) saturate(1)' },
					'50%': { filter: 'brightness(1.3) saturate(1.5)' }
				},
				'quantum-field': {
					'0%': { backgroundPosition: '0% 0%' },
					'50%': { backgroundPosition: '100% 100%' },
					'100%': { backgroundPosition: '0% 0%' }
				},
				// Base animations
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				// Resonance System Animations
				'pulse-resonance': 'pulse-resonance 2s ease-in-out infinite',
				'cymatic-formation': 'cymatic-formation 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'frequency-wave': 'frequency-wave 3s ease-in-out infinite',
				'emergence': 'emergence 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
				'phase-shift': 'phase-shift 4s linear infinite',
				'harmonic-glow': 'harmonic-glow 2s ease-in-out infinite',
				'quantum-field': 'quantum-field 10s ease-in-out infinite',
				// Base animations
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
