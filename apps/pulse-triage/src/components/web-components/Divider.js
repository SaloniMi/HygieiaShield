/**
 * Divider Component
 * Calm UI separator with optional centered label
 */

import React from "react";
import { typography } from "@/styles/design-tokens";

export default function Divider({ text }) {
    return (
        <div className="flex items-center w-full my-2">
            {/* Left line */}
            <div className="flex-1 h-px bg-slate-200" />

            {/* Optional label */}
            {text && (
                <span
                    className="
            px-3
            text-xs
            text-slate-500
            tracking-wide
            whitespace-nowrap
          "
                    style={{
                        fontFamily: typography.fontFamily?.base,
                    }}
                >
                    {text}
                </span>
            )}

            {/* Right line */}
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}