'use client';

import { useEffect, useState } from 'react';
import PatientQueue from '@/components/PatientQueue';
import PatientBrief from '@/components/PatientBrief';
import PulseOpsHeader from '@/components/PulseOpsHeader';

export default function PulseOpsDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientBrief, setSelectedPatientBrief] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isQueueLoading, setIsQueueLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchQueue() {
      try {
        const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
        const response = await fetch(`${API_GATEWAY}/pulse-ops/queue`);
        if (!response.ok) {
          throw new Error('Failed to fetch queue');
        }

        const data = await response.json();

        if (cancelled) return;

        setPatients(data);

        // Auto - select first patient on initial load
        setSelectedPatientId(currentSelected => {
          if (currentSelected) {
            const stillExists = data.some(
              patient => patient.id === currentSelected
            );

            if (stillExists) {
              return currentSelected;
            }
          }

          return data[0]?.id ?? null;
        });
      } catch (error) {
        console.error('Failed to refresh queue', error);
      } finally {
        if (!cancelled) {
          setIsQueueLoading(false);
        }
      }
    }

    fetchQueue();

    const interval = setInterval(fetchQueue, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatientBrief(null);
      return;
    }

    let cancelled = false;

    async function fetchPatientBrief() {
      try {
        const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

        const response = await fetch(
          `${API_GATEWAY}/pulse-ops/patients/${selectedPatientId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch patient brief');
        }

        const data = await response.json();

        if (!cancelled) {
          setSelectedPatientBrief(data);
        }
      } catch (error) {
        console.error('Failed to fetch patient brief', error);
      }
    }

    // Initial fetch
    fetchPatientBrief();

    // Poll every minute while this patient is selected
    const interval = setInterval(fetchPatientBrief, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedPatientId]);

  const selectedPatient = patients.find(
    patient => patient.id === selectedPatientId
  );

  const handleAcknowledge = async () => {
    if (!selectedPatientId) return;

    setIsLoading(true);

    try {
      await fetch(
        `/api/pulseops/patients/${selectedPatientId}/acknowledge`,
        {
          method: 'POST',
        }
      );

      // Optional immediate refresh
      const response = await fetch('/api/pulseops/queue');
      const data = await response.json();

      setPatients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f4f3f0] text-[#1a1a18] overflow-hidden font-sans">
      <PulseOpsHeader />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] h-[calc(100vh-48px)] overflow-hidden">
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
            {selectedPatient && selectedPatientBrief ? (
              <PatientBrief
                patient={selectedPatientBrief}
                onAcknowledge={handleAcknowledge}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white border border-black/10 rounded-[14px] p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] mb-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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
    </div>
  );
}