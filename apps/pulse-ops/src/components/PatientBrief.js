'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ESI_LEVELS } from '@/constants/esi-severity';
import { useSession } from 'next-auth/react';
import ClinicalBriefTab from './ClinicalBriefTab';
import VitalsEntryTab from './VitalsEntryTab';
import AgentTraceTab from './AgentTraceTab';
import { getAgeGroupDisplay } from '@hygieiashield/clinical-protocols';
import DashboardFooter from './DashboardFooter';
import {
    VITALS_LOINC,
    formatVitalFlagsForClinician
} from '@hygieiashield/clinical-protocols';


const INITIAL_VITALS = Object.entries(VITALS_LOINC).reduce(
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
export default function PatientBrief({ patientId, isLoading }) {
    const { data: session, status } = useSession();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('clinical-brief');
    const [isAcknowledged, setIsAcknowledged] = useState(patient?.status === "ACKNOWLEDGED");
    const [vitals, setVitals] = useState(INITIAL_VITALS);
    const [vitalsLocked, setVitalsLocked] = useState(false);
    const [gatekeeperData, setGatekeeperData] = useState(null);
    const [isRunningGatekeeper, setIsRunningGatekeeper] = useState(false);

    const intervalRef = useRef(null);
    const cancelledRef = useRef(false);
    const hydratedPatientRef = useRef(null);

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
    // EVENT-DRIVEN REFRESH (exposed to children)
    // -------------------------
    const handlePatientUpdate = useCallback(() => {
        fetchPatient();
    }, [fetchPatient]);

    useEffect(() => {
        if (!patient) return;

        if (hydratedPatientRef.current === patient.id) {
            return;
        }

        hydratedPatientRef.current = patient.id;

        const locked =
            !!patient?.vitals &&
            Object.values(patient.vitals).some(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ''
            );

        setVitalsLocked(locked);

        setVitals({
            ...INITIAL_VITALS,
            ...(patient?.vitals ?? {})
        });

        if (locked && patient?.vitalFlags) {
            setGatekeeperData({
                success: true,
                flags: formatVitalFlagsForClinician(
                    patient.vitalFlags
                )
            });
        }
    }, [patient]);


    const handleVitalsChange = useCallback((key, value) => {
        const config = VITALS_LOINC[key];

        let normalizedValue = value;

        if (config?.inputType === 'number') {
            normalizedValue =
                value === ''
                    ? ''
                    : Number(value);
        }

        setVitals((prev) => ({
            ...prev,
            [key]: normalizedValue
        }));
    }, []);

    const cleanVitals = useMemo(() => {
        return Object.entries(vitals).reduce(
            (acc, [key, value]) => {
                if (
                    value === '' ||
                    value === null ||
                    value === undefined
                ) {
                    return acc;
                }

                const cfg = VITALS_LOINC[key];

                if (cfg?.inputType === 'number') {
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

    }, [vitals]);

    const handleRunGatekeeper = useCallback(async () => {
        if (!patient) return;

        try {
            setIsRunningGatekeeper(true);

            const response = await fetch(
                `${API_GATEWAY}/pulse-ops/vitals`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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
                }
            );

            if (response.ok) {
                const result = await response.json();

                const vitalFlags =
                    result?.data?.vitalFlags ?? [];

                setGatekeeperData({
                    success: true,
                    flags: formatVitalFlagsForClinician(
                        vitalFlags
                    )
                });

                setVitalsLocked(true);

                handlePatientUpdate();
            } else {
                const error = await response.json();

                setGatekeeperData({
                    success: false,
                    error:
                        error.message ??
                        'Failed computation of vitals'
                });
            }
        } catch (error) {
            setGatekeeperData({
                success: false,
                error: error.message
            });
        } finally {
            setIsRunningGatekeeper(false);
        }
    }, [
        patient,
        cleanVitals,
        API_GATEWAY,
        handlePatientUpdate
    ]);

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

    let tabs = [
        { id: 'clinical-brief', label: 'Clinical brief' },
        { id: 'vitals-entry', label: 'Vitals entry' },
        { id: 'agent-trace', label: 'Agent trace' }
    ];
    if (session?.user?.role === "doctor") {
        tabs = [
            { id: 'clinical-brief', label: 'Clinical brief' }
        ];
    }


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
        <div className="flex flex-col h-full bg-[#f4f3f0] text-[#1a1a18] text-[13px] font-sans">
            <div className="border border-black/10 rounded-[14px] bg-white overflow-hidden shadow-sm flex flex-col flex-1">

                {/* HEADER */}
                <div className="bg-[#042C53] px-[18px] py-[14px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-[22px] font-bold text-white tracking-[2px]">
                                {patient.token}
                            </span>

                            <span className={`ml-2 text-[11px] font-semibold px-[9px] py-[3px] rounded-full ${getSeverityBadgeClass(esiInfo.label)}`}>
                                {esiInfo.label}
                            </span>

                            <span className="ml-1 text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[#B5D4F4] text-[#042C53]">
                                {patient.status}
                            </span>
                            {patient.wardType && (
                                <span className="ml-1 text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[#B5D4F4] text-[#042C53]">
                                    {patient.wardType}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-[12px] text-[#B5D4F4] mt-[3px]">
                        {patient.patientName} · {getAgeGroupDisplay(patient.ageGroup)}
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-black/10 bg-white">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-[16px] py-[10px] text-[12px] font-medium border-b-2 mb-[-0.5px] ${activeTab === tab.id
                                ? 'border-[#185FA5] text-[#0C447C] font-semibold'
                                : 'border-transparent text-[#6b6a66]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto bg-white">

                    {activeTab === 'clinical-brief' && (
                        <ClinicalBriefTab patient={patient} isActive={activeTab === 'clinical-brief'} />
                    )}

                    {activeTab === 'vitals-entry' && (
                        <VitalsEntryTab
                            vitals={vitals}
                            vitalsLocked={vitalsLocked}
                            gatekeeperData={gatekeeperData}
                            isRunningGatekeeper={isRunningGatekeeper}
                            onVitalsChange={handleVitalsChange}
                            onRunGatekeeper={handleRunGatekeeper}
                        />
                    )}

                    {activeTab === 'agent-trace' && (
                        <AgentTraceTab patient={patient} isActive={activeTab === 'agent-trace'} />
                    )}
                </div>

                {/* FOOTER */}
                <DashboardFooter onAcknowledge={handleAcknowledge} isDisabled={patient?.status !== "ARRIVED"} acknowledgePermissionAllowed={session?.user?.role !== "doctor"} isAcknowledged={isAcknowledged} />
            </div>
        </div>
    );
}