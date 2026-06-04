/**
 * Input Component
 * Accessible form input with calm design
 * Supports loading, disabled, error, and helper text
 */
import { useId } from "react";

export default function Input({
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    isLoading = false,
    error,
    helperText,
    label,
    id,
    required = false,
    maxLength,
    className = '',
    ariaLabel,
    ariaDescribedBy,
    ...props
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const baseInputStyles = `
        w-full
        h-12
        px-5
        text-lg
        font-normal
        rounded-2xl
        border
        transition-colors
        duration-200
        outline-none
        bg-white
        text-slate-800
        placeholder:text-slate-400
        placeholder:text-lg
    `;

    const borderStyles = error
        ? `
      border-red-300
      focus:border-red-400
    `
        : `
      border-slate-200
      focus:border-sky-300
    `;

    const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950' : '';

    const inputClasses = `${baseInputStyles} ${borderStyles} ${disabledStyles} ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="
                        block
                        mb-1.5
                        text-[12px]
                        font-medium
                        text-slate-600
                    "
                >
                    {label}
                    {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    id={inputId}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    disabled={disabled || isLoading}
                    maxLength={maxLength}
                    className={inputClasses}
                    aria-label={ariaLabel}
                    aria-describedby={
                        [error && errorId, helperText && helperId, ariaDescribedBy]
                            .filter(Boolean)
                            .join(' ') || undefined
                    }
                    aria-invalid={!!error}
                    required={required}
                    {...props}
                />

                {isLoading && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <svg
                            className="h-4 w-4 animate-spin text-sky-500"
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
                    </div>
                )}
            </div>

            {error && (
                <p
                    id={errorId}
                    className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
                    role="alert"
                >
                    <span aria-hidden="true">⚠</span>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p
                    id={helperId}
                    className="mt-2 text-sm text-slate-500 dark:text-slate-400"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
}
