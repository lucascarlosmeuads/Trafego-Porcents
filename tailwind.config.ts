
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
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
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
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Cores da identidade visual Tráfego Porcents
				'trafego': {
					'dark-bg': '#1a1a2e',
					'dark-card': '#16213e',
					'dark-accent': '#0f3460',
					'light-text': '#f8fafc',
					'muted-text': '#94a3b8',
					'primary-blue': '#3b82f6',
					'success-green': '#10b981',
					'warning-yellow': '#f59e0b',
					'danger-red': '#ef4444',
				},
				// Sistema de cores profissional para métricas
				'reach': {
					'50': '#eff6ff',
					'100': '#dbeafe',
					'500': '#3b82f6',
					'600': '#2563eb',
					'900': '#1e3a8a',
				},
				'clicks': {
					'50': '#f0fdf4',
					'100': '#dcfce7',
					'500': '#22c55e',
					'600': '#16a34a',
					'900': '#14532d',
				},
				'spend': {
					'50': '#faf5ff',
					'100': '#f3e8ff',
					'500': '#a855f7',
					'600': '#9333ea',
					'900': '#581c87',
				},
				'ctr': {
					'50': '#fffbeb',
					'100': '#fef3c7',
					'500': '#f59e0b',
					'600': '#d97706',
					'900': '#78350f',
				},
				'cost': {
					'50': '#f0fdfa',
					'100': '#ccfbf1',
					'500': '#14b8a6',
					'600': '#0d9488',
					'900': '#134e4a',
				},
				'conversion': {
					'50': '#ecfdf5',
					'100': '#d1fae5',
					'500': '#10b981',
					'600': '#059669',
					'900': '#064e3b',
				},
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #10b981 100%)',
				'gradient-trafego': 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
				'gradient-trafego-hover': 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
				// Gradientes profissionais para métricas
				'gradient-reach': 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
				'gradient-clicks': 'linear-gradient(135deg, #dcfce7 0%, #22c55e 100%)',
				'gradient-spend': 'linear-gradient(135deg, #f3e8ff 0%, #a855f7 100%)',
				'gradient-ctr': 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
				'gradient-cost': 'linear-gradient(135deg, #ccfbf1 0%, #14b8a6 100%)',
				'gradient-conversion': 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
				// Gradientes para cards
				'gradient-card': 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
				'gradient-card-hover': 'linear-gradient(145deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '1rem',
				'2xl': '1.5rem',
				'3xl': '2rem',
			},
			boxShadow: {
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'metric': '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
				'metric-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
				'professional': '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
				'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
				'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '200% 0'
					},
					'100%': {
						backgroundPosition: '-200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'shimmer': 'shimmer 2s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
