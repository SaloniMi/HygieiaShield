/**
 * Badge Component
 * Pill-shaped badge for status, tags, and indicators
 * Supports multiple variants and loading state
 */

import { ICONS } from '@/styles/icons'


export default function Badge({
    children,
    variant = 'primary', // 'primary', 'secondary', 'warning', 'error', 'success', 'info'
    size = 'md', // 'sm', 'md', 'lg'
    isLoading = false,
    // isDark = false,
    className = '',
    icon,
    onRemove,
    ariaLabel,
}) {
    const sizeStyles = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const variantStyles = {
        primary: `
      bg-sky-100 dark:bg-sky-950
      text-sky-700 dark:text-sky-300
      border border-sky-200 dark:border-sky-800
    `,
        secondary: `
      bg-emerald-100 dark:bg-emerald-950
      text-emerald-700 dark:text-emerald-300
      border border-emerald-200 dark:border-emerald-800
    `,
        warning: `
      bg-amber-100 dark:bg-amber-950
      text-amber-700 dark:text-amber-300
      border border-amber-200 dark:border-amber-800
    `,
        error: `
      bg-red-100 dark:bg-red-950
      text-red-700 dark:text-red-300
      border border-red-200 dark:border-red-800
    `,
        success: `
      bg-emerald-100 dark:bg-emerald-950
      text-emerald-700 dark:text-emerald-300
      border border-emerald-200 dark:border-emerald-800
    `,
        info: `
      bg-sky-100 dark:bg-sky-950
      text-sky-700 dark:text-sky-300
      border border-sky-200 dark:border-sky-800
    `,
    };

    const baseStyles = `
    inline-flex
    items-center
    justify-center
    gap-1.5
    font-medium
    rounded-full
    whitespace-nowrap
    transition-all
    duration-200
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${isLoading ? 'opacity-70' : ''}
  `;

    const Icon = icon ? ICONS[icon] : null;

    return (
        <span
            className={`${baseStyles} ${className}`}
            aria-label={ariaLabel}
            role="status"
        >
            {isLoading ? (
                <span className="mr-1 inline-flex">
                    <svg
                        className="h-3 w-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </span>
            ) : Icon ? (
                <span className="mr-1 inline-flex items-center">
                    <Icon
                        size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
                    />
                </span>
            ) : null}

            {children}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 inline-flex items-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label={`Remove ${children}`}
                    type="button"
                >
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </span>
    );
}
