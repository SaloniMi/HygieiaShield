'use client';

import { useState } from 'react';
import { VITALS_LOINC } from '@hygieiashield/clinical-protocols';

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
    ui
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
                    type="number"
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
                    value={value}
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
export default function VitalsEntryTab({ patient }) {

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

    const [vitals, setVitals] = useState(initialVitals);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleRunGatekeeper = async () => {
        setIsLoading(true);

        try {
            const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
            console.log(vitals)
            await fetch(`${API_GATEWAY}/pulse-ops/vitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient,
                    vitals
                }),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4">

            {/* LEFT */}
            <div className="space-y-3">

                <h3 className="text-[11px] font-bold uppercase text-[#9a9994]">
                    Enter vitals
                </h3>

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
                        />
                    ))}

                </div>
                <button
                    onClick={handleRunGatekeeper}
                    disabled={isLoading}
                    className="w-full bg-[#0C447C] text-white py-2 rounded-[10px]"
                >
                    {isLoading ? 'Recomputing...' : 'Save Vitals and re-compute →'}
                </button>
            </div>

        </div>
    );
}