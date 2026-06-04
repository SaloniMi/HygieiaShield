'use client';

import React from 'react';

export default function PulseTriageLoader({
    title = "Agents are analyzing symptoms",
    subtitle = "Running triage models…"
}) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#f8f7f4] dark:bg-slate-950 text-slate-900 dark:text-slate-100">

            {/* Icon container */}
            <div className="relative flex items-center justify-center pb-3">

                {/* Soft pulse glow matching primary #1e4e8c */}
                <div className="absolute w-28 h-28 rounded-full bg-[#1e4e8c]/20 animate-ping" />
                <div className="absolute w-40 h-40 rounded-full bg-[#1e4e8c]/10 animate-pulse" />

                {/* Main icon */}
                <img
                    src="/hygieia-shield.png"
                    alt="PulseTriage AI"
                    className="w-36 h-36 relative z-10"
                />
            </div>

            {/* Text */}
            <h1 className="mt-6 text-lg font-semibold tracking-tight">
                {title}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
            </p>

            {/* Animated ECG line matching primary #1e4e8c */}
            <div className="mt-6 w-48 h-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1e4e8c]/40 to-transparent animate-pulse" />
                <div className="absolute inset-0 border-t border-[#1e4e8c]/30" />
            </div>

        </div>
    );
}


