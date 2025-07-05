
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
					'dark-bg': '222.2 84% 4.9%',
					'dark-card': '222.2 84% 7%',
					'dark-accent': '217.2 32.6% 17.5%',
					'light-text': '210 40% 98%',
					'muted-text': '215 20.2% 65.1%',
					'primary-blue': '217.2 91.2% 59.8%',
					'success-green': '142 71% 45%',
					'warning-yellow': '45 93% 47%',
					'danger-red': '0 84% 60%',
				},
				// Sistema de cores profissional para métricas
				'metrics': {
					'reach': {
						'50': '219 100% 97%',
						'100': '219 100% 94%',
						'500': '217 91% 60%',
						'600': '217 91% 55%',
						'900': '217 91% 25%',
					},
					'clicks': {
						'50': '142 76% 96%',
						'100': '142 76% 91%',
						'500': '142 71% 45%',
						'600': '142 71% 40%',
						'900': '142 71% 20%',
					},
					'spend': {
						'50': '271 91% 97%',
						'100': '271 91% 94%',
						'500': '271 81% 56%',
						'600': '271 81% 51%',
						'900': '271 81% 26%',
					},
					'ctr': {
						'50': '25 100% 97%',
						'100': '25 100% 94%',
						'500': '25 95% 53%',
						'600': '25 95% 48%',
						'900': '25 95% 23%',
					},
					'cost': {
						'50': '195 100% 97%',
						'100': '195 100% 94%',
						'500': '195 84% 56%',
						'600': '195 84% 51%',
						'900': '195 84% 26%',
					},
					'conversion': {
						'50': '160 100% 97%',
						'100': '160 100% 94%',
						'500': '160 84% 39%',
						'600': '160 84% 34%',
						'900': '160 84% 19%',
					},
				}
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, hsl(217.2 91.2% 59.8%) 0%, hsl(271 81% 56%) 50%, hsl(142 71% 45%) 100%)',
				'gradient-trafego': 'linear-gradient(135deg, hsl(217.2 91.2% 59.8%) 0%, hsl(142 71% 45%) 100%)',
				'gradient-trafego-hover': 'linear-gradient(135deg, hsl(217.2 91.2% 49.8%) 0%, hsl(142 71% 35%) 100%)',
				// Gradientes profissionais para métricas
				'gradient-reach': 'linear-gradient(135deg, hsl(219 100% 94%) 0%, hsl(217 91% 60%) 100%)',
				'gradient-clicks': 'linear-gradient(135deg, hsl(142 76% 91%) 0%, hsl(142 71% 45%) 100%)',
				'gradient-spend': 'linear-gradient(135deg, hsl(271 91% 94%) 0%, hsl(271 81% 56%) 100%)',
				'gradient-ctr': 'linear-gradient(135deg, hsl(25 100% 94%) 0%, hsl(25 95% 53%) 100%)',
				'gradient-cost': 'linear-gradient(135deg, hsl(195 100% 94%) 0%, hsl(195 84% 56%) 100%)',
				'gradient-conversion': 'linear-gradient(135deg, hsl(160 100% 94%) 0%, hsl(160 84% 39%) 100%)',
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
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
