/**
 * Card Component
 * Calm, rounded card for content grouping
 * Supports loading and disabled states
 */

import { shadows } from '@/styles/design-tokens';

export default function Card({
    children,
    className = '',
    variant = 'default', // 'default', 'elevated', 'outlined'
    isLoading = false,
    isDisabled = false,
    isDark = false,
}) {
    const variantStyles = {
        default: `dark:bg-slate-800 ${shadows.md} dark:${shadows.dark.md}`,
        elevated: `bg-white dark:bg-slate-800 ${shadows.lg} dark:${shadows.dark.lg}`,
        outlined: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700`,
    };

    const baseStyles = `
    rounded-lg
    p-6
    transition-all
    duration-200
    ${variantStyles[variant]}
    ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${isLoading ? 'pointer-events-none' : ''}
  `;

    return (
        <div className={`${baseStyles} ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 dark:bg-slate-800/50">
                    <div className="relative h-8 w-8">
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-sky-500 dark:border-t-sky-400"></div>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
