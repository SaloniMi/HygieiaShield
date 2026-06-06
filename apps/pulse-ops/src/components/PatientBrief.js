'use client';

import { useState } from 'react';
import { ESI_LEVELS } from '@/constants/esi-severity';
import ClinicalBriefTab from './ClinicalBriefTab';
import VitalsEntryTab from './VitalsEntryTab';
import AgentTraceTab from './AgentTraceTab';
import { getAgeGroupDisplay } from '@hygieiashield/clinical-protocols';

/**
 * PatientBrief
 * Main panel showing selected patient record with 4 tabs and matching HTML mockup aesthetics
 */
export default function PatientBrief({
    patient
}) {
    console.log(patient)
    const [activeTab, setActiveTab] = useState('clinical-brief');
    const [isAcknowledged, setIsAcknowledged] = useState(false)

    const tabs = [
        { id: 'clinical-brief', label: 'Clinical brief' },
        { id: 'vitals-entry', label: 'Vitals entry' },
        { id: 'agent-trace', label: 'Agent trace' }
    ];

    const esiInfo = ESI_LEVELS[patient.esiLevel] || ESI_LEVELS[3];

    // Helper mapping for mockup severity colors based on ESI label / severity level
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

                {/* Header Section (Matching .detail-header) */}
                <div className="bg-[#042C53] px-[18px] py-[14px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-[22px] font-bold text-white tracking-[2px]">
                                {patient.token}
                            </span>
                            <span className={`ml-2 text-[11px] font-semibold px-[9px] py-[3px] rounded-full ${getSeverityBadgeClass(esiInfo.label)}`}>
                                {esiInfo.label || 'Critical'}
                            </span>
                            <span className="ml-1 text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[#B5D4F4] text-[#042C53]">
                                {patient.status}
                            </span>
                        </div>
                        <div className="text-[11px] text-[#B5D4F4]">
                            Soft reservation active
                        </div>
                    </div>
                    <div className="text-[12px] text-[#B5D4F4] mt-[3px]">
                        {patient.patientName} · {getAgeGroupDisplay(patient.ageGroup)}
                    </div>
                </div>

                {/* Tab Navigation Row (Matching .tab-row) */}
                <div className="flex border-b border-black/10 bg-white">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-[16px] py-[10px] text-[12px] font-medium transition-all duration-150 border-b-2 mb-[-0.5px] outline-none ${activeTab === tab.id
                                ? 'border-[#185FA5] text-[#0C447C] font-semibold'
                                : 'border-transparent text-[#6b6a66] hover:text-[#1a1a18]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Content Panel */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {activeTab === 'clinical-brief' && (
                        <ClinicalBriefTab patient={patient} />
                    )}

                    {activeTab === 'vitals-entry' && (
                        <VitalsEntryTab patient={patient} />
                    )}

                    {/* {activeTab === 'agent-trace' && (
                        <AgentTraceTab trace={patient.agentTrace} />
                    )} */}
                </div>

                {/* Footer Bar (Matching .footer-bar) */}
                <div className="px-[16px] py-[12px] border-t border-black/10 flex gap-2 items-center bg-white">
                    <button
                        disabled={isAcknowledged}
                        onClick={() => setIsAcknowledged(true)}
                        className={`px-[16px] py-[8px] border rounded-[10px] text-[12px] font-semibold transition-all duration-150 text-white ${isAcknowledged
                            ? 'bg-[#085041] border-[#085041] cursor-not-allowed opacity-90'
                            : 'bg-[#0F6E56] border-[#0F6E56] hover:bg-[#085041]'
                            }`}
                    >
                        {isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge & proceed'}
                    </button>
                    <div className="ml-auto flex items-center gap-[5px] text-[11px] text-[#0F6E56] font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[14px] h-[14px]" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path>
                            <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                            <path d="M12 12l0 2.5"></path>
                        </svg>
                        HygieiaCore verified
                    </div>
                </div>

            </div>
        </div>
    );
}