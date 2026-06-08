/**
 * AgentTraceTab
 * Monospace dark terminal rendering structured array traces as a single, 
 * continuous inline streaming log exactly matching the mockup imagery.
 */
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function AgentTraceTab({ patient, isActive }) {
    const [trace, setTrace] = useState([]);

    const intervalRef = useRef(null);
    const cancelledRef = useRef(false);

    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    const patientId = patient?.id;
    const status = patient?.status;
    const patientToken = patient?.token;

    const shouldPoll =
        isActive &&
        patientId &&
        (status === 'PLANNED' || status === 'ARRIVED');

    const fetchTrace = useCallback(async () => {
        if (!patientId) return;

        try {
            const res = await fetch(
                `${API_GATEWAY}/pulse-ops/patients/${patientId}/agent-trace`
            );

            if (!res.ok) return;

            const data = await res.json();
            const incoming = data?.agentTrace || [];

            if (cancelledRef.current) return;

            // 🔥 append-style merge (safe dedupe)
            setTrace(prev => {
                const existing = prev || [];

                const merged = [
                    ...existing,
                    ...incoming.filter(
                        n =>
                            !existing.some(
                                e =>
                                    e.timestamp === n.timestamp &&
                                    e.agent?.name === n.agent?.name
                            )
                    )
                ];

                return merged;
            });

        } catch (err) {
            console.error('trace fetch failed', err);
        }
    }, [API_GATEWAY, patientId]);

    // -------------------------
    // POLLING LIFECYCLE (TAB-OWNED)
    // -------------------------
    useEffect(() => {
        if (!shouldPoll) return;

        cancelledRef.current = false;

        fetchTrace();

        intervalRef.current = setInterval(() => {
            fetchTrace();
        }, 60000); // 60s

        return () => {
            cancelledRef.current = true;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [shouldPoll, fetchTrace]);

    if (!trace || trace.length === 0) {
        return (
            <div className="p-4 text-[12px] text-[#6b6a66] font-mono">
                No active agent traces available for {patientToken}.
            </div>
        );
    }

    /**
     * Extracts a clean local time string (HH:MM) from the ISO field
     */
    const formatTerminalTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toTimeString().split(' ')[0].substring(0, 5); // Returns HH:MM
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="p-4 space-y-3">
            {/* Section Header */}
            <div className="text-[11px] font-bold text-[#9a9994] uppercase tracking-wider">
                HygieiaCore agent trace — {patientToken}
            </div>

            {/* Dark Mode Code Terminal Screen */}
            <div className="bg-[#0d1117] border border-black/10 rounded-[10px] p-[12px_14px] overflow-y-auto max-h-[380px] font-mono text-[11px] leading-[1.8] text-[#8b949e] whitespace-normal break-words">
                {trace.map((item, idx) => {
                    const timeStr = formatTerminalTime(item.timestamp);

                    return (
                        /* Changed to block element with bottom margin so each agent entry starts on a new line */
                        <div key={idx} className="block mb-1.5 last:mb-0">
                            {/* 1. Agent Tag Block - Info Blue */}
                            <span className="text-[#79c0ff] font-medium">
                                {timeStr ? `[${timeStr}] ` : ''}{item.agent?.name || 'Agent'}
                            </span>

                            {/* 2. Input Content - Neutral Gray */}
                            {item.input && (
                                <span className="text-[#8b949e]">
                                    {' '}Input: "{item.input}"
                                </span>
                            )}


                            {/* 3. Mapped Bullets Tracking Stream - Conditional Warnings */}
                            {item.bullets && item.bullets.length > 0 && (
                                <span className="inline">
                                    {item.bullets.map((bullet, bIdx) => {
                                        const cleanBullet = bullet.trim();
                                        return (
                                            <span
                                                key={bIdx}
                                                className="text-[#3fb950]"
                                            >
                                                {' '}→ {cleanBullet}
                                            </span>
                                        );
                                    })}
                                </span>
                            )}

                            {/* 4. Summary / Core Resolution Milestone - Green */}
                            {item.headline && (
                                <span className={item.isCriticalFinding ? "text-[#f85149] font-bold" : "text-[#e6edf3]"} >
                                    {' '}→ {item.headline}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#f8f7f4] border border-black/10 rounded-[8px] p-2.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#79c0ff]" />
                    <span>Agents</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#8b949e]" />
                    <span>Input</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3fb950]" />
                    <span>Standard Pipeline Extractions</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#e6edf3]" />
                    <span>Standard Agent Outputs</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#f85149]" />
                    <span>Critical Agent Warning Flags</span>
                </div>
            </div>
        </div>
    );
}