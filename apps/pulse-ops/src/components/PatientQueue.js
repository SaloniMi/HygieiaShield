'use client';

import { useMemo, useState } from 'react';
import { filterPatients } from '@/lib/fuzzy-search';
import { getAgeGroupDisplay } from '@hygieiashield/clinical-protocols';

export default function PatientQueue({
    patients,
    selectedPatientId,
    onSelectPatient,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const sortedPatients = useMemo(() => {
        const filtered = filterPatients(patients, searchQuery);

        return [...filtered].sort((a, b) => {
            const aIncoming = a.status === 'PLANNED';
            const bIncoming = b.status === 'PLANNED';

            if (aIncoming && !bIncoming) return -1;
            if (!aIncoming && bIncoming) return 1;

            if (a.esiLevel !== b.esiLevel) {
                return a.esiLevel - b.esiLevel;
            }

            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });
    }, [patients, searchQuery]);


    const incomingPatients = sortedPatients.filter(
        (p) => p.status === 'PLANNED'
    );

    const triagedPatients = sortedPatients.filter(
        (p) => p.status === 'ARRIVED'
    );

    const acknowledgedPatients = sortedPatients.filter(
        (p) => p.status === 'ACKNOWLEDGED'
    );

    const renderPatient = (patient) => {
        const isSelected = selectedPatientId === patient.id;

        // Severity configurations exactly matching CSS (.crit, .mod, .low)
        let severityColor = 'bg-[#97C459]'; // Default .low
        if (patient.esiLevel <= 2) {
            severityColor = 'bg-[#E24B4A]'; // .crit
        } else if (patient.esiLevel === 3) {
            severityColor = 'bg-[#EF9F27]'; // .mod
        }

        return (
            <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`
                    w-full
                    text-left
                    border-b
                    border-[rgba(0,0,0,0.06)]
                    flex
                    items-start
                    gap-2
                    cursor-pointer
                    transition-colors
                    duration-120
                    px-3.5
                    py-2.5
                    ${isSelected ? 'bg-[#E6F1FB] border-l-[2.5px] border-l-[#185FA5]' : 'bg-transparent hover:bg-[#f8f7f4]'}
                `}
            >
                {/* Severity Dot (.sev-dot) */}
                <div
                    className={`
                        mt-1
                        h-2
                        w-2
                        rounded-full
                        shrink-0
                        ${severityColor}
                    `}
                />

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <h3 className="text-[13px] font-semibold text-[#1a1a18] truncate leading-tight">
                            {patient.patientName}
                        </h3>

                        <span
                            className="
                                    shrink-0
                                    text-[10px]
                                    bg-[#E6F1FB]
                                    text-[#0C447C]
                                    border
                                    border-[#B5D4F4]
                                    rounded-full
                                    px-1.5
                                    py-0.5
                                    text-right
                                    mt-0.5
                                "
                        >
                            {patient.token}
                        </span>
                    </div>

                    <div className="mt-0.5 flex items-start justify-between gap-1">
                        <div className="text-[11px] text-[#6b6a66] truncate leading-normal">
                            {getAgeGroupDisplay(patient.ageGroup)}
                        </div>

                    </div>
                </div>
            </button>
        );
    };

    return (
        <aside
            className="
                w-[260px]
                shrink-0
                border-r
                border-[rgba(0,0,0,0.1)]
                bg-white
                flex
                flex-col
                overflow-hidden
                h-full
            "
        >
            {/* Search Box Wrapper (.search-wrap) */}
            <div className="p-2 border-b border-[rgba(0,0,0,0.06)]">
                <input
                    type="text"
                    placeholder="Search name or token…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                        h-[28px]
                        w-full
                        rounded-[8px]
                        border
                        border-[rgba(0,0,0,0.1)]
                        bg-[#f8f7f4]
                        px-2.5
                        text-[12px]
                        text-[#1a1a18]
                        placeholder:text-[#9a9994]
                        focus:outline-none
                        focus:border-[#378ADD]
                    "
                />
            </div>

            {/* Queue List Area (.queue) */}
            <div className="flex-1 overflow-y-auto">

                {incomingPatients.length !== 0 && (
                    <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-bold tracking-[0.5px] text-[#9a9994] uppercase">
                        Incoming
                    </div>
                )}
                {incomingPatients.map(renderPatient)}


                {triagedPatients.length !== 0 && (
                    <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-bold tracking-[0.5px] text-[#9a9994] uppercase">
                        Triaged
                    </div>
                )}
                {triagedPatients.map(renderPatient)}

                {acknowledgedPatients.length !== 0 && (
                    <div className="px-3.5 pb-1.5 pt-3 text-[10px] font-bold tracking-[0.5px] text-[#9a9994] uppercase">
                        Waiting for ward
                    </div>
                )}
                {acknowledgedPatients.map(renderPatient)}

                {/* Empty State (.notice fallback structure) */}
                {sortedPatients.length === 0 && (
                    <div className="p-[10px] text-center text-[12px] italic text-[#6b6a66]">
                        No patients found
                    </div>
                )}
            </div>
        </aside>
    );
}