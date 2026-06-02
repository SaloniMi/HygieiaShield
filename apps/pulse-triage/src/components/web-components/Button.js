/**
 * Button Component
 * Accessible button with large touch targets
 * Supports multiple variants, loading, and disabled states
 */

import { colors, spacing, radii, typography } from '@/styles/design-tokens';

export default function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
    size = 'md', // 'sm', 'md', 'lg'
    isLoading = false,
    isDisabled = false,
    className = '',
    ariaLabel,
    ...props
}) {
    const sizeStyles = {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-5 text-base',
        lg: 'h-14 px-6 text-base',
    };

    const variantStyles = {
        primary: `
       bg-[#185FA5]
        text-white

        hover:bg-[#0369a1]
        active:bg-[#075985]

        focus-visible:ring-2
        focus-visible:ring-sky-300
    `,
        secondary: `
      bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
      dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:active:bg-emerald-700
      text-white
      shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900
    `,
        outline: `
      border-2 border-sky-400 dark:border-sky-500
      text-sky-600 dark:text-sky-400
      hover:bg-sky-50 dark:hover:bg-sky-950/30
      active:bg-sky-100 dark:active:bg-sky-900/30
      focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900
    `,
        ghost: `
      text-sky-600 dark:text-sky-400
      hover:bg-sky-50 dark:hover:bg-sky-950/30
      active:bg-sky-100 dark:active:bg-sky-900/30
      focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900
    `,
        danger: `
      bg-red-500 hover:bg-red-600 active:bg-red-700
      dark:bg-red-600 dark:hover:bg-red-500 dark:active:bg-red-700
      text-white
      shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900
    `,
    };

    const baseStyles = `
    inline-flex
    items-center
    justify-center

    w-full

    rounded-2xl

    font-semibold
    tracking-normal

    transition-colors
    duration-200

    outline-none

    whitespace-nowrap
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${isDisabled || isLoading ? 'bg-slate-200 text - slate - 400 cursor - not - allowed hover: bg - slate - 200 active: bg - slate - 200' : ''}
    disabled: opacity - 60
    disabled: cursor - not - allowed
        `;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled || isLoading}
            className={`${baseStyles} ${className} `}
            aria-label={ariaLabel}
            aria-busy={isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="h-4 w-4 animate-spin"
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
            )}
            {children}
        </button>
    );
}
