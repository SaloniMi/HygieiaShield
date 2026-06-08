'use client';
import { ESI_LEVELS } from '@/constants/esi-severity';
import { formatVitalFlagsForClinician, formatVitalsForClinician } from "@hygieiashield/clinical-protocols"
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ClinicalBriefTab
 * Displays pre-arrival observables, ESI level, risk flags, recommended actions,
 * protocol matches, SNOMED codes, agent confidence, and an input for clinical notes.
 */
export default function ClinicalBriefTab({ patient, isActive }) {
    const [brief, setBrief] = useState(null);

    const intervalRef = useRef(null);
    const mountedRef = useRef(false);
    const cancelledRef = useRef(false);

    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    const fetchBrief = useCallback(async (id) => {
        if (!id) return;

        try {
            const res = await fetch(
                `${API_GATEWAY}/pulse-ops/patients/${id}/brief`
            );

            if (!res.ok) throw new Error("Failed brief fetch");

            const data = await res.json();

            if (cancelledRef.current) return;

            setBrief(data?.brief ?? null);

            return data?.brief;
        } catch (err) {
            console.error(err);

            setBrief(prev => ({
                ...(prev ?? {}),
                status: "FAILED"
            }));
        }
    }, [API_GATEWAY]);

    useEffect(() => {
        if (!isActive || !patient?.id) return;

        // ✅ StrictMode guard (prevents double init in dev)
        if (mountedRef.current) return;
        mountedRef.current = true;

        cancelledRef.current = false;

        const start = async () => {
            const brief = await fetchBrief(patient.id);

            // stop polling if READY
            if (brief?.status === "READY") return;

            intervalRef.current = setInterval(() => {
                fetchBrief(patient.id);
            }, 60000);
        };

        start();

        return () => {
            cancelledRef.current = true;
            mountedRef.current = false;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, patient?.id, fetchBrief]);

    const briefStatus = brief?.status ?? "READY";

    if (!brief) return null;

    if (briefStatus === "FAILED") {
        return (
            <div className="p-4">
                <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-[10px] px-3 py-2">
                    <div className="text-xs font-semibold text-[#791F1F]">
                        Clinical summary unavailable
                    </div>
                    <div className="text-[11px] text-[#791F1F]/80">
                        Unable to generate the latest physician brief.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Status Banner */}

            {briefStatus === "PENDING" && (
                <div className="bg-[#E6F1FB] border border-[#A7C8E8] rounded-[10px] px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-[#185FA5]">
                                Clinical summary updating
                            </div>

                            <div className="text-[11px] text-[#185FA5]/80">
                                Incorporating latest observations and vital signs.
                            </div>
                        </div>

                        <svg
                            className="w-4 h-4 animate-spin text-[#185FA5]"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                opacity=".25"
                            />
                            <path
                                d="M22 12a10 10 0 00-10-10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {/* Pre-arrival observables */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                            Pre-arrival observables
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {patient.observables.map((observable) => (
                                <span
                                    key={observable}
                                    className="inline-block bg-[#EEEDFE] text-[#3C3489] border border-[#AFA9EC] text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                                >
                                    {observable.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </section>

                    {patient.patientNotes && patient.patientNotes.length > 0 && (
                        <section>
                            <h3 className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                                Pre-arrival observables
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {patient.observables.map((observable) => (
                                    <span
                                        key={observable}
                                        className="inline-block bg-[#EEEDFE] text-[#3C3489] border border-[#AFA9EC] text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                                    >
                                        {observable.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ESI Classification */}
                    <section>
                        <h3 className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                            ESI classification
                        </h3>
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: ESI_LEVELS[patient.esiLevel]?.bgColor || '#EEEDFE',
                                    color: ESI_LEVELS[patient.esiLevel]?.color || '#3C3489',
                                    border: '0.5px solid rgba(0,0,0,0.1)'
                                }}
                            >
                                ESI Level {patient.esiLevel}
                            </span>
                            <span className="text-xs text-[#6b6a66]">
                                {ESI_LEVELS[patient.esiLevel]?.name || 'High risk'}
                            </span>
                        </div>
                    </section>

                    {/* Agent 3 Risk Flags */}
                    {patient?.vitalFlags && patient?.vitalFlags.length > 0 && (
                        <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-[10px] p-2.5">
                            <div className="text-xs font-bold text-[#791F1F] mb-1 flex items-center gap-1.5">
                                {/* Simple inline SVG replacement for ti-alert-triangle */}
                                <svg className="w-3.5 h-3.5 text-[#E24B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Vital flags
                            </div>
                            <div className="text-xs text-[#A32D2D] leading-relaxed">
                                {formatVitalFlagsForClinician(patient?.vitalFlags).map((flag, idx) => (
                                    <div key={idx}>
                                        • {flag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agent 4 Risk Flags */}
                    {brief?.riskFlags && brief?.riskFlags.length > 0 && (
                        <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-[10px] p-2.5">
                            <div className="text-xs font-bold text-[#791F1F] mb-1 flex items-center gap-1.5">
                                {/* Simple inline SVG replacement for ti-alert-triangle */}
                                <svg className="w-3.5 h-3.5 text-[#E24B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Clinical observations
                            </div>
                            <div className="text-xs text-[#A32D2D] leading-relaxed">
                                {brief?.riskFlags.map((flag, idx) => (
                                    <div key={idx}>
                                        • {flag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chief Complaint */}
                    <div className="border-l-[2.5px] border-[#378ADD] pl-2.5">
                        <div className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wide mb-0.5">
                            Chief complaint
                        </div>
                        <div className="text-sm text-[#1a1a18] leading-relaxed">
                            {brief?.chiefComplaint}
                        </div>
                    </div>

                    {patient.vitals && (
                        < div className="border-l-[2.5px] border-[#378ADD] pl-2.5">
                            <div className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wide mb-0.5">
                                Vitals
                            </div>
                            <div className="text-sm text-[#A32D2D] font-semibold leading-relaxed">
                                {formatVitalsForClinician(patient.vitals)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Recommended actions */}
                    <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-[10px] p-2.5">
                        <div className="text-xs font-bold text-[#085041] mb-2 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#0F6E56]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Recommended actions
                        </div>
                        <div className="space-y-1.5">
                            {brief.recommendedActions?.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[#0F6E56] Atlantic leading-relaxed">
                                    <div className="w-4 h-4 rounded-full bg-[#9FE1CB] text-[#085041] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protocol match */}
                    {brief?.protocolMatch && (
                        <div className="border-l-[2.5px] border-[#378ADD] pl-2.5">
                            <div className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wide mb-0.5">
                                Protocol match
                            </div>
                            <div className="text-sm text-[#1a1a18] leading-relaxed">
                                {brief.protocolMatch?.name} — {brief.protocolMatch?.rationale}
                            </div>
                        </div>
                    )}

                    {/* Agent confidence */}
                    <div className="border-l-[2.5px] border-[#378ADD] pl-2.5">
                        <div className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wide mb-0.5">
                            Confidence
                        </div>
                        <div className="text-sm text-[#0F6E56] font-semibold leading-relaxed">
                            {brief.confidence?.level ?? "MEDIUM"} — {brief.confidence?.explanation ?? " All Agents are in agreement"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}