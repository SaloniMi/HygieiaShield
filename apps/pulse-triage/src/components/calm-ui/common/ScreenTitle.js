import React from "react";
import { colors, spacing, typography } from '@/styles/design-tokens';

export default function ScreenTitle({
    title,
    subtitle,
    badgeLabel,
    badgeStatus = 'info',
}) {
    const badgeStyles = {
        critical: {
            backgroundColor: colors.error[100],
            color: colors.error[700],
            borderColor: colors.error[200],
        },
        warning: {
            backgroundColor: colors.warning[100],
            color: colors.warning[700],
            borderColor: colors.warning[200],
        },
        success: {
            backgroundColor: colors.secondary[100],
            color: colors.secondary[700],
            borderColor: colors.secondary[200],
        },
        info: {
            backgroundColor: colors.primary[100],
            color: colors.primary[700],
            borderColor: colors.primary[200],
        },
    };

    const badgeStyle = badgeStyles[badgeStatus] || badgeStyles.info;

    return (
        <section>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                }}
            >
                <h1
                    style={{
                        color: colors.neutral[900],
                        fontSize: typography.size["2xl"],
                        fontWeight: typography.weight.semibold,
                        lineHeight: typography.lineHeight.tight,
                        margin: 0,
                    }}
                >
                    {title}
                </h1>

                {badgeLabel && (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: `${spacing.xs} ${spacing.sm}`,
                            borderRadius: 9999,
                            fontSize: typography.size.xs,
                            fontWeight: typography.weight.semibold,
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                            border: `1px solid ${badgeStyle.borderColor}`,
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                        }}
                    >
                        {badgeLabel}
                    </span>
                )}
            </div>

            {subtitle && (
                <p
                    style={{
                        color: colors.neutral[600],
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.normal,
                        lineHeight: typography.lineHeight.relaxed,
                        marginTop: spacing.sm,
                        marginBottom: 0,
                        maxWidth: "26rem",
                    }}
                >
                    {subtitle}
                </p>
            )}
        </section>
    );
}