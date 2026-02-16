// Design System Constants
export const colors = {
  // Surfaces
  background: 'bg-[#0A0A0B]',
  surface: 'bg-[#13141A]',
  surfaceElevated: 'bg-[#1A1B23]',
  surfaceHover: 'hover:bg-[#1A1B23]',
  
  // Borders
  border: 'border-[#252631]',
  borderHover: 'hover:border-[#2F3142]',
  
  // Primary
  primary: 'bg-indigo-500',
  primaryHover: 'hover:bg-indigo-600',
  primaryText: 'text-indigo-400',
  primaryBorder: 'border-indigo-500/30',
  primaryBg: 'bg-indigo-500/10',
  
  // Success
  success: 'bg-emerald-500',
  successText: 'text-emerald-400',
  successBorder: 'border-emerald-500/30',
  successBg: 'bg-emerald-500/10',
  
  // Warning
  warning: 'bg-amber-500',
  warningText: 'text-amber-400',
  warningBorder: 'border-amber-500/30',
  warningBg: 'bg-amber-500/10',
  
  // Error
  error: 'bg-rose-500',
  errorText: 'text-rose-400',
  errorBorder: 'border-rose-500/30',
  errorBg: 'bg-rose-500/10',
  
  // Info
  info: 'bg-blue-500',
  infoText: 'text-blue-400',
  infoBorder: 'border-blue-500/30',
  infoBg: 'bg-blue-500/10',
  
  // Text
  textPrimary: 'text-[#F9FAFB]',
  textSecondary: 'text-[#9CA3AF]',
  textTertiary: 'text-[#6B7280]',
};

export const spacing = {
  page: 'max-w-7xl mx-auto',
  section: 'space-y-6',
  card: 'p-6',
  cardLarge: 'p-8',
};

export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
};

export const effects = {
  card: 'bg-[var(--surface)] border border-[var(--border)] rounded-2xl transition-all',
  cardHover: 'hover:bg-[var(--surface-elevated)] hover:border-indigo-500/30 hover:scale-[1.01]',
  button: 'px-6 py-3 rounded-xl font-medium transition-all',
  buttonPrimary: 'bg-indigo-500 hover:bg-indigo-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25',
  buttonSecondary: 'bg-[var(--surface-elevated)] hover:bg-[var(--border)] border border-[var(--border)]',
  input: 'bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all',
  badge: 'px-3 py-1 rounded-lg text-xs font-medium',
  glow: 'shadow-lg shadow-indigo-500/10',
};

export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
};
