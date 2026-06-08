'use client';

import { useState } from 'react';
import { VITALS_LOINC, formatVitalFlagsForClinician } from '@hygieiashield/clinical-protocols';

/**
 * Reusable VitalCard Component
 */
function VitalCard({
    label,
    value,
    onChange,
    placeholder,
    loinc,
    isFlagged,
    inputType,
    ui,
    disabled,
    required
}) {
    const baseClass = `w-full p-[7px_9px] border rounded-[8px] text-[13px] bg-white text-[#1a1a18] outline-none transition-colors focus:border-[#378ADD]`;

    const flaggedClass = isFlagged
        ? 'border-[#E24B4A] bg-[#FCEBEB]'
        : 'border-black/10';

    return (
        <div className={`border rounded-[10px] p-[9px_11px] transition-colors ${isFlagged
            ? 'bg-[#FCEBEB] border-[#F7C1C1]'
            : 'bg-[#f8f7f4] border-black/10'
            }`}>
            <div className="text-[10px] text-[#6b6a66] font-semibold uppercase tracking-wider mb-1">
                {label}
            </div>

            {/* INPUT RENDERING BY TYPE */}
            {inputType === 'number' && (
                <input
                    disabled={disabled}
                    type="number"
                    required={required}
                    value={value}
                    step={ui?.step}
                    min={ui?.min}
                    max={ui?.max}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${baseClass} ${flaggedClass}`}
                />
            )}

            {inputType === 'boolean' && (
                <button
                    disabled={disabled}
                    required={required}
                    onClick={() => onChange(!value)}
                    className={`w-full p-2 rounded-[8px] text-xs border transition-colors ${value
                        ? 'bg-[#0C447C] text-white border-[#0C447C]'
                        : 'bg-white border-black/10 text-[#1a1a18]'
                        }`}
                >
                    {value ? 'Yes' : 'No'}
                </button>
            )}

            {inputType === 'select' && (
                <select
                    disabled={disabled}
                    value={value}
                    required={required}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseClass} ${flaggedClass}`}
                >
                    <option value="">Select</option>
                    {ui?.options?.map(opt => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            )}

            <div className="text-[9px] text-[#9a9994] mt-0.5 font-mono">
                {loinc || '—'}
            </div>
        </div>
    );
}

/**
 * Main Component
 */
export default function VitalsEntryTab({ patient, onPatientUpdate }) {
    const [vitalsLocked, setVitalsLocked] = useState(
        !!patient?.vitals &&
        Object.values(patient.vitals).some(
            value =>
                value !== null &&
                value !== undefined &&
                value !== ''
        )
    );

    const initialVitals = Object.entries(VITALS_LOINC).reduce(
        (acc, [key, cfg]) => {
            switch (cfg.inputType) {
                case 'number':
                    acc[key] = '';
                    break;

                case 'boolean':
                    acc[key] = false;
                    break;

                default:
                    acc[key] = '';
            }

            return acc;
        },
        {}
    );
    const [vitals, setVitals] = useState({
        ...initialVitals,
        ...(patient?.vitals ?? {})
    });
    const [gatekeeperData, setGatekeeperData] = useState(
        vitalsLocked && patient?.vitalFlags
            ? {
                success: true,
                flags: formatVitalFlagsForClinician(patient.vitalFlags)
            }
            : null
    ); const [isRunningGatekeeper, setIsRunningGatekeeper] = useState(false);

    const renderGatekeeperOutput = () => {
        if (isRunningGatekeeper) {
            return (
                <div className="flex-1 flex items-center justify-center bg-[#f8f7f4] border border-black/10 rounded-[10px] p-3 text-xs text-[#6b6a66] min-h-[120px]">
                    Running GateKeeper...
                </div>
            );
        }

        if (!gatekeeperData) {
            return (
                <div className="flex-1 flex items-center justify-center bg-[#f8f7f4] border border-black/10 rounded-[10px] p-3 text-xs text-[#6b6a66] min-h-[120px]">
                    Enter vitals and run GateKeeper to see flags
                </div>
            );
        }

        if (!gatekeeperData.success) {
            return (
                <div className="flex-1 bg-[#FCEBEB] border border-[#F7C1C1] rounded-[10px] p-3 text-xs text-[#A32D2D] min-h-[120px]">
                    Error: {gatekeeperData.error || 'Unknown workflow issue'}
                </div>
            );
        }

        if (gatekeeperData.flags.length === 0) {
            return (
                <div className="flex-1 bg-[#E1F5EE] border border-[#9FE1CB] rounded-[10px] p-3 min-h-[120px]">
                    <div className="text-xs font-semibold text-[#085041] flex items-center gap-1">
                        <svg
                            className="w-3.5 h-3.5 text-[#0F6E56]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        All vitals within safe range. No flags raised.
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 bg-[#FCEBEB] border border-[#F7C1C1] rounded-[10px] p-3 min-h-[120px]">
                <div className="text-xs font-bold text-[#791F1F] mb-1 flex items-center gap-1.5">
                    <svg
                        className="w-3.5 h-3.5 text-[#E24B4A]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    Risk flags
                </div>

                <div className="text-xs text-[#A32D2D] leading-relaxed">
                    {gatekeeperData.flags.map((flag, idx) => (
                        <div key={idx}>{flag}</div>
                    ))}
                </div>
            </div>
        );
    };

    const REQUIRED_VITALS = Object.entries(VITALS_LOINC)
        .filter(([_, cfg]) => cfg.required !== false)
        .map(([key]) => key);

    const requiredVitalsFilled = REQUIRED_VITALS.every((key) => {
        const value = vitals[key];

        return (
            value !== '' &&
            value !== null &&
            value !== undefined &&
            !(typeof value === 'number' && Number.isNaN(value))
        );
    });

    const handleChange = (key, value) => {

        const config = VITALS_LOINC[key];

        let normalizedValue = value;

        if (config?.inputType === 'number') {
            normalizedValue =
                value === ''
                    ? ''
                    : Number(value);
        }

        setVitals(prev => ({
            ...prev,
            [key]: normalizedValue
        }));
    };

    const cleanVitals = Object.entries(vitals).reduce(
        (acc, [key, value]) => {
            if (value === "" || value === null || value === undefined) {
                return acc;
            }

            const cfg = VITALS_LOINC[key];

            if (cfg?.inputType === "number") {
                const num = Number(value);
                if (!Number.isNaN(num)) {
                    acc[key] = num;
                }
                return acc;
            }

            acc[key] = value;
            return acc;
        },
        {}
    );

    const handleRunGatekeeper = async () => {

        try {
            setIsRunningGatekeeper(true);
            const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
            const response = await fetch(`${API_GATEWAY}/pulse-ops/vitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        patient,
                        vitals: cleanVitals
                    },
                    trace: {
                        patientId: patient.id,
                        encounterId: patient.encounterId,
                        token: patient.token
                    }
                })
            });
            if (response.ok) {
                const result = await response.json();
                const vitalFlags = result?.data?.vitalFlags ?? [];
                const flagsArray = formatVitalFlagsForClinician(vitalFlags)
                setGatekeeperData({ success: true, flags: flagsArray });
                setVitalsLocked(true);
                // notify parent (this is the important part)
                onPatientUpdate?.();
            } else {
                const error = await response.json();
                setGatekeeperData({ success: false, error: error.message ?? 'Failed computation of vitals, please re-check your vitals, or try again.' });
            }
        } catch (error) {
            setGatekeeperData({ success: false, error: error.message });
        } finally {
            setIsRunningGatekeeper(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            {vitalsLocked && (
                <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-[10px] px-3 py-2">
                    <div className="text-xs font-semibold text-[#085041]">
                        Arrival vitals recorded
                    </div>
                    <div className="text-[11px] text-[#085041]/80">
                        Vitals have already been captured for this patient.
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">

                {/* LEFT */}
                <div className="space-y-3">

                    <h3 className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                        Enter vitals
                    </h3>
                    <div className="text-xs text-[#6b6a66] p-0.5 text-center italic">
                        Fields below are nurse-entered on arrival.
                    </div>

                    <div className="grid grid-cols-2 gap-2">

                        {Object.entries(VITALS_LOINC).map(([key, cfg]) => (
                            <VitalCard
                                key={key}
                                label={`${cfg.display}${cfg.unit ? ` (${cfg.unit})` : ""}`}
                                value={vitals[key]}
                                onChange={(val) => handleChange(key, val)}
                                placeholder={cfg.ui?.placeholder}
                                loinc={cfg.code}
                                inputType={cfg.inputType}
                                ui={cfg.ui}
                                required={cfg.required}
                                disabled={vitalsLocked}
                            />
                        ))}

                    </div>
                    <button
                        onClick={handleRunGatekeeper}
                        disabled={
                            vitalsLocked ||
                            !requiredVitalsFilled ||
                            isRunningGatekeeper
                        }
                        className={`w-full py-2 rounded-[10px] text-white ${vitalsLocked || !requiredVitalsFilled || isRunningGatekeeper
                            ? 'bg-[#9a9994] cursor-not-allowed'
                            : 'bg-[#0C447C]'
                            }`}
                    >
                        {isRunningGatekeeper
                            ? 'Running GateKeeper...'
                            : vitalsLocked
                                ? 'Vitals Recorded'
                                : 'Save Vitals and Re-compute →'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                        Vitals computation output
                    </h3>

                    {renderGatekeeperOutput()}
                </div>
            </div>
        </div>
    );
}