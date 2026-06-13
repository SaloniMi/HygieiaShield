"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import PatientQueue from '@/components/PatientQueue';
import PatientBrief from '@/components/PatientBrief';
import PulseOpsHeader from '@/components/PulseOpsHeader';

export default function PatientsDashboard(facility) {

    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const [isQueueLoading, setIsQueueLoading] = useState(true);

    const intervalRef = useRef(null);
    const cancelledRef = useRef(false);

    const [isLoading, setIsLoading] = useState(false);
    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    const fetchQueue = useCallback(async () => {
        try {
            const response = await fetch(`${API_GATEWAY}/pulse-ops/queue`);

            if (!response.ok) {
                throw new Error("Failed to fetch queue");
            }

            const data = await response.json();

            if (cancelledRef.current) return;

            setPatients(data);

            setSelectedPatientId((current) => {
                if (current) {
                    const stillExists = data.some((p) => p.id === current);
                    if (stillExists) return current;
                }

                return data[0]?.id ?? null;
            });
        } catch (error) {
            console.error("Failed to refresh queue", error);
        } finally {
            if (!cancelledRef.current) {
                setIsQueueLoading(false);
            }
        }
    }, [API_GATEWAY]);

    // Queue polling
    useEffect(() => {
        cancelledRef.current = false;

        fetchQueue();

        intervalRef.current = setInterval(() => {
            fetchQueue();
        }, 30000);

        return () => {
            cancelledRef.current = true;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchQueue]);

    const selectedPatient = patients.find(
        (p) => p.id === selectedPatientId
    );


    // -------------------------
    // UI
    // -------------------------
    return (

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] h-[calc(100vh-48px)] overflow-hidden">

            {/* QUEUE */}
            <div className="border-b md:border-b-0 md:border-r border-black/10 bg-white overflow-y-auto">
                <PatientQueue
                    patients={patients}
                    selectedPatientId={selectedPatientId}
                    onSelectPatient={setSelectedPatientId}
                    isLoading={isQueueLoading}
                />
            </div>

            <div className="flex flex-col min-w-0 overflow-y-auto p-4 md:p-[16px] bg-[#f4f3f0]">
                <div className="flex-1 flex flex-col h-full">

                    {selectedPatient ? (
                        <PatientBrief
                            patientId={selectedPatientId}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-black/10 rounded-[14px] p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-[14px] font-bold text-[#1a1a18] mb-1">
                                No Patient Selected
                            </h3>

                            <p className="text-[12px] text-[#6b6a66] max-w-xs">
                                Please choose a patient from the queue to review metrics.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}