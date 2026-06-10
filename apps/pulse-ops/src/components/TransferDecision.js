'use client';

import { useState } from 'react';
import { formatVitalsForClinician } from '@hygieiashield/clinical-protocols';

export default function TransferDecisionCard({
    patientId,
    onApprove
}) {
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('clinical-brief');
    const [isAcknowledged, setIsAcknowledged] = useState(patient?.status === "ACKNOWLEDGED");

    const intervalRef = useRef(null);
    const cancelledRef = useRef(false);

    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    // -------------------------
    // FETCH PATIENT (single source)
    // -------------------------
    const fetchPatient = useCallback(async () => {
        if (!patientId) return;

        try {
            const response = await fetch(
                `${API_GATEWAY}/pulse-ops/patients/${patientId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch patient');
            }

            const data = await response.json();

            if (!cancelledRef.current) {
                setPatient(data);
            }

        } catch (error) {
            console.error('Failed to fetch patient', error);
        }
    }, [API_GATEWAY, patientId]);

    // -------------------------
    // LIFECYCLE + POLLING (3 min)
    // -------------------------
    useEffect(() => {
        if (!patientId) return;

        cancelledRef.current = false;

        // initial fetch
        fetchPatient();

        // polling every 3 minutes
        intervalRef.current = setInterval(() => {
            fetchPatient();
        }, 180000); // 3 min

        return () => {
            cancelledRef.current = true;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [patientId, fetchPatient]);

    // -------------------------
    // EVENT-DRIVEN REFRESH (exposed to children)
    // -------------------------
    const handlePatientUpdate = useCallback(() => {
        fetchPatient();
    }, [fetchPatient]);

    // -------------------------
    // ACKNOWLEDGE (now owned here)
    // -------------------------
    const handleAcknowledge = async () => {
        if (!patientId) return;

        try {
            await fetch(
                `${API_GATEWAY}/pulse-ops/patients/${patientId}/acknowledge`,
                { method: 'POST' }
            );

            // immediate refresh after mutation
            fetchPatient();

            setIsAcknowledged(true);

        } catch (error) {
            console.error(error);
        }
    };

    if (!patient) {
        return (
            <div className="flex-1 flex items-center justify-center text-xs text-[#6b6a66]">
                Loading patient...
            </div>
        );
    }

    const esiInfo = ESI_LEVELS[patient.esiLevel] || ESI_LEVELS[3];

    const getSeverityBadgeClass = (label) => {
        if (label?.toLowerCase().includes('critical') || patient.esiLevel <= 2) {
            return 'bg-[#F7C1C1] text-[#791F1F]';
        }
        if (label?.toLowerCase().includes('moderate') || patient.esiLevel === 3) {
            return 'bg-[#B5D4F4] text-[#042C53]';
        }
        return 'bg-[#9FE1CB] text-[#085041]';
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f3f0] text - [#1a1a18] text - [13px] font - sans">
            <div className="border border-black/10 rounded-[14px] bg-white overflow-hidden shadow-sm flex flex-col">

                {/* 1. & 2. HEADER: Patient Token, Info, and ESI Badge */}
                <div className="bg-[#042C53] px-[18px] py-[14px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-[22px] font-bold text-white tracking-[2px]">
                                {patient.token}
                            </span>
                            <span className={`text-[11px] font-semibold px-[9px] py-[3px] rounded-full ${getSeverityBadgeClass(patient.esiLevel)}`}>
                                {esiInfo.label}
                            </span>
                        </div>
                        <div className="text-[11px] text-[#B5D4F4] font-medium">
                            Awaiting Disposition
                        </div>
                    </div>

                    <div className="text-[12px] text-[#B5D4F4] mt-[3px] font-medium">
                        {patient.patientName} · {getAgeGroupDisplay(patient.ageGroup)}
                    </div>
                </div>

                {/* CARD BODY CONTENT */}
                <div className="p-[18px] space-y-4 bg-white flex-1 overflow-y-auto">

                    {/* 1. Patient Summary Section */}
                    <div>
                        {/* <span className="text-[11px] uppercase tracking-wider text-[#6b6a66] font-bold block mb-1">
                            Patient Summary
                        </span> */}
                        {/* <p className="text-[#1a1a18] leading-relaxed font-normal">
                            {patient.summary}
                        </p> */}
                        <div className="mt-2 p-2 bg-[#f4f3f0] rounded-[6px] text-[12px] font-mono text-[#4a4945]">
                            {formatVitalsForClinician(patient.vitals)}
                        </div>
                    </div>

                    <div className="border-t border-black/5" />

                    {/* 3. ICU Recommendation Section */}
                    <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#791F1F] font-bold flex items-center space-x-1 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#791F1F] inline-block animate-pulse" />
                            <span>Ward Recommendation Target</span>
                        </span>
                        <p className="text-[#1a1a18] leading-relaxed">
                            {patient.wardType}
                        </p>
                    </div>

                    <div className="border-t border-black/5" />

                    {/* 4. Capacity Snapshot Section */}
                    <div className="bg-[#f4f3f0]/50 p-3 rounded-[8px] border border-black/5">
                        <span className="text-[11px] uppercase tracking-wider text-[#6b6a66] font-bold block mb-1.5">
                            Destination Capacity Snapshot
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div>
                                <span className="text-[#6b6a66] block">Available Beds:</span>
                                <span className="font-bold text-[14px] text-[#042C53]">
                                    {patient.capacity.availableBeds} / {patient.capacity.totalBeds}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#6b6a66] block">ICU Bed Strain:</span>
                                <span className="font-bold text-[14px] text-[#791F1F]">
                                    {patient.capacity.utilizationRate} Capacity
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTON FOOTER */}
                <div className="border-t border-black/10 px-[18px] py-[14px] bg-[#f4f3f0]/30 flex flex-col sm:flex-row gap-2">


                    {/* 5. Approve Transfer Button */}
                    <button
                        onClick={onApprove}
                        disabled={isAcknowledged}
                        className="flex-1 px-[16px] py-[10px] text-[13px] font-semibold text-white rounded-[8px] bg-[#185FA5] hover:bg-[#0C447C] transition-colors duration-150 shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : 'Approve Transfer'}
                    </button>

                </div>
            </div>
        </div>
    );
}