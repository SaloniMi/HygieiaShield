"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Clock, Info } from "lucide-react";

export default function ShiftCoordinatorDashboard({ facilityId }) {
    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    const intervalRef = useRef(null);
    const cancelledRef = useRef(false);

    const [isLoading, setIsLoading] = useState(true);

    const [facility, setFacility] = useState(null);
    const [arrivals, setArrivals] = useState([]);
    const [encounters, setEncounters] = useState([]);
    const [isUpdatingRouting, setIsUpdatingRouting] = useState(false);
    const [isUpdatingEncounter, setIsUpdatingEncounter] = useState(false);

    const [updatingCareType, setUpdatingCareType] = useState(null);

    const fetchDashboard = useCallback(async () => {
        if (!facilityId) return
        try {

            const res = await fetch(
                `${API_GATEWAY}/pulse-ops/dashboard/${facilityId}`
            );

            if (!res.ok) {
                throw new Error("Failed loading dashboard");
            }

            const data = await res.json();
            console.log(data)
            if (!cancelledRef.current) {
                setFacility(data.facility);
                setArrivals(data.incomingPatients ?? []);
                setEncounters(data.activeEncounters ?? []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (!cancelledRef.current) {
                setIsLoading(false);
            }
        }
    }, [API_GATEWAY, facilityId]);

    const updateActiveEncounter = useCallback(
        async (encounter) => {
            if (!facilityId || isUpdatingEncounter) return;

            try {
                setIsUpdatingEncounter(true);

                const response = await fetch(
                    `${API_GATEWAY}/pulse-ops/dashboard/${facilityId}/complete-encounter`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            encounter
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to update encounter");
                }

                // Backend is source of truth.
                // Immediately reload dashboard state.
                await fetchDashboard();
            } catch (error) {
                console.error(error);
            } finally {
                setIsUpdatingEncounter(false);
            }
        },
        [
            API_GATEWAY,
            facilityId,
            fetchDashboard,
            isUpdatingEncounter
        ]
    );

    const updateRouting = useCallback(
        async (careType, routingPaused) => {
            if (!facilityId || isUpdatingRouting) return;

            try {
                setIsUpdatingRouting(true);
                setUpdatingCareType(careType);

                const response = await fetch(
                    `${API_GATEWAY}/pulse-ops/dashboard/${facilityId}/routing`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            careType,
                            routingPaused
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to update routing");
                }

                // Backend is source of truth.
                // Immediately reload dashboard state.
                await fetchDashboard();
            } catch (error) {
                console.error(error);
            } finally {
                setIsUpdatingRouting(false);
                setUpdatingCareType(null);
            }
        },
        [
            API_GATEWAY,
            facilityId,
            fetchDashboard,
            isUpdatingRouting
        ]
    );

    useEffect(() => {
        cancelledRef.current = false;

        fetchDashboard();

        // refresh every 2 minutes
        intervalRef.current = setInterval(
            fetchDashboard,
            120000
        );

        return () => {
            cancelledRef.current = true;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchDashboard]);

    if (isLoading || !facility) {
        return (
            <div className="flex items-center justify-center h-full">
                Loading...
            </div>
        );
    }

    const emergency = facility.emergency;
    const urgentCare = facility.urgentCare;
    const outpatient = facility.outpatient;

    const totalOccupied =
        emergency.occupied +
        urgentCare.occupied +
        outpatient.occupied;

    const totalPending =
        emergency.pending +
        urgentCare.pending +
        outpatient.pending;

    const totalCapacity =
        emergency.capacity +
        urgentCare.capacity +
        outpatient.capacity;

    const surgeIndex = Math.round(
        ((totalOccupied + totalPending) / totalCapacity) * 100
    );

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-[16px] bg-[#f4f3f0] text-[#1a1a18] font-sans antialiased selection:bg-[#B5D4F4]">

            {/* TOP BAR / BADGE */}
            {/* <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#F7C1C1] text-[#791F1F] font-semibold text-[11px] px-2.5 py-1 rounded-full border border-[#791F1F]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#791F1F] animate-pulse"></span>
                    Surge active — {surgeIndex}%
                </span>
            </div> */}

            {/* FACILITY SURGE INDEX CONTROL PANEL */}
            <div className="border border-black/10 rounded-[14px] bg-white p-4 md:p-5 shadow-xs mb-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] font-semibold text-[#6b6a66]">Facility surge index</span>
                            <span className="text-[14px] font-bold text-[#791F1F]">{surgeIndex}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#f4f3f0] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#F7C1C1] to-[#E25C5C] rounded-full"
                                style={{ width: `${surgeIndex}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#6b6a66] mt-2 flex items-center gap-1">
                            Computed from occupied + pending across all care types
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wider mb-3">
                Care Type Occupancy
            </h2>

            {/* THREE COLUMNS: CARE TYPE OCCUPANCY CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

                {/* EMERGENCY CARD */}
                <div
                    className={`rounded-[14px] bg-white p-4 flex flex-col shadow-xs relative overflow-hidden
                        ${!emergency.routingPaused
                            ? "border border-[#F7C1C1] ring-1 ring-[#F7C1C1]/20"
                            : "border border-black/10 opacity-80"
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-[13px] font-bold text-[#1a1a18]">Emergency</h3>
                            <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-[24px] font-bold leading-none">{emergency.occupied}</span>
                                <span className="text-[#6b6a66] text-[13px]">/ {emergency.capacity}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-bold bg-[#F7C1C1] text-[#791F1F] px-1.5 py-0.5 rounded-[4px]">
                                ESI 1-3
                            </span>
                            <span className="text-[11px] text-[#6b6a66] bg-[#f4f3f0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={11} className="text-[#6b6a66]" /> {emergency.pending} incoming
                            </span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-[#E25C5C]" style={{ width: `${(emergency.occupied / emergency.capacity) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6b6a66] mb-4">
                        <span>{Math.round((emergency.occupied / emergency.capacity) * 100)}% occupied</span>
                        <span>{emergency.capacity - emergency.occupied} open</span>
                    </div>
                    <button
                        disabled={isUpdatingRouting && updatingCareType === "emergency"}
                        onClick={() =>
                            updateRouting(
                                "emergency",
                                !emergency.routingPaused
                            )
                        }
                        className="w-full mt-auto border border-black/10 hover:border-black/20 text-[12px] font-semibold py-2 rounded-[8px] transition-colors flex items-center justify-center gap-1.5 bg-white shadow-xs disabled:opacity-50"
                    >
                        {emergency.routingPaused ? (
                            <>▶ Start ER routing</>
                        ) : (
                            <>
                                <span className="inline-block w-1 h-2.5 border-x border-[#1a1a18] mx-[1px]" />
                                Pause ER routing
                            </>
                        )}
                    </button>
                </div>

                {/* URGENT CARE CARD */}
                <div className="border border-black/10 rounded-[14px] bg-white p-4 flex flex-col shadow-xs">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-[13px] font-bold text-[#1a1a18]">Urgent care</h3>
                            <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-[24px] font-bold leading-none">{urgentCare.occupied}</span>
                                <span className="text-[#6b6a66] text-[13px]">/ {urgentCare.capacity}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-bold bg-[#FCE8D5] text-[#A2622B] px-1.5 py-0.5 rounded-[4px]">
                                ESI 4
                            </span>
                            <span className="text-[11px] text-[#6b6a66] bg-[#f4f3f0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={11} className="text-[#6b6a66]" /> {urgentCare.pending} incoming
                            </span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-[#E69E4B]" style={{ width: `${(urgentCare.occupied / urgentCare.capacity) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6b6a66] mb-4">
                        <span>{Math.round((urgentCare.occupied / urgentCare.capacity) * 100)}% occupied</span>
                        <span>{urgentCare.capacity - urgentCare.occupied} open</span>
                    </div>
                    <button
                        disabled={isUpdatingRouting && updatingCareType === "urgentCare"}
                        onClick={() =>
                            updateRouting(
                                "urgentCare",
                                !urgentCare.routingPaused
                            )
                        }
                        className="w-full mt-auto border border-black/10 hover:border-black/20 text-[12px] font-semibold py-2 rounded-[8px] transition-colors flex items-center justify-center gap-1.5 bg-white shadow-xs disabled:opacity-50"
                    >
                        {urgentCare.routingPaused ? (
                            <>▶ Start urgent care routing</>
                        ) : (
                            <>
                                <span className="inline-block w-1 h-2.5 border-x border-[#1a1a18] mx-[1px]" />
                                Pause urgent care routing
                            </>
                        )}
                    </button>
                </div>

                {/* OUTPATIENT CARD */}
                <div className="border border-black/10 rounded-[14px] bg-white p-4 flex flex-col shadow-xs">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-[13px] font-bold text-[#1a1a18]">Outpatient</h3>
                            <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-[24px] font-bold leading-none">{outpatient.occupied}</span>
                                <span className="text-[#6b6a66] text-[13px]">/ {outpatient.capacity}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-bold bg-[#B5D4F4] text-[#042C53] px-1.5 py-0.5 rounded-[4px]">
                                ESI 5
                            </span>
                            <span className="text-[11px] text-[#6b6a66] bg-[#f4f3f0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={11} className="text-[#6b6a66]" /> {outpatient.pending} incoming
                            </span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-[#4BB393]" style={{ width: `${(outpatient.occupied / outpatient.capacity) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6b6a66] mb-4">
                        <span>{Math.round((outpatient.occupied / outpatient.capacity) * 100)}% occupied</span>
                        <span>{outpatient.capacity - outpatient.occupied} open</span>
                    </div>
                    <button
                        disabled={isUpdatingRouting && updatingCareType === "outpatients"}
                        onClick={() =>
                            updateRouting(
                                "outpatient",
                                !outpatient.routingPaused
                            )
                        }
                        className="w-full mt-auto border border-black/10 hover:border-black/20 text-[12px] font-semibold py-2 rounded-[8px] transition-colors flex items-center justify-center gap-1.5 bg-white shadow-xs disabled:opacity-50"
                    >
                        {outpatient.routingPaused ? (
                            <>▶ Start outpatient routing</>
                        ) : (
                            <>
                                <span className="inline-block w-1 h-2.5 border-x border-[#1a1a18] mx-[1px]" />
                                Pause outpatient routing
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* LOWER SPLIT SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ANTICIPATED ARRIVALS BLOCK */}
                <div className="border border-black/10 rounded-[14px] bg-white p-4 flex flex-col shadow-xs">
                    <h2 className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wider mb-3">
                        Anticipated Arrivals
                    </h2>

                    <div className="space-y-1.5 flex-1">
                        {arrivals.map((arrival) => (
                            <div key={arrival.reservationId} className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#f4f3f0]/40 border border-black/[0.02]">
                                <div className="flex items-center gap-2.5">
                                    <span className={`w-2 h-2 rounded-full ${arrival.careType === 'ER' ? 'bg-[#E25C5C]' :
                                        arrival.careType === 'UrgentCare' ? 'bg-[#E69E4B]' :
                                            'bg-[#4BB393]'
                                        }`} />
                                    <span className="text-[13px] font-semibold text-[#1a1a18]">{arrival.patientName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <span className="text-[11px] font-mono tracking-wider text-[#6b6a66]">
                                        {arrival.token}
                                    </span>
                                    <div className="min-w-[75px]">
                                        <div className={`text-[10px] font-bold uppercase ${arrival.careType === 'emergency' ? 'text-[#791F1F]' : 'text-[#A2622B]'}`}>
                                            {arrival.careType}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTIVE ENCOUNTERS BLOCK */}
                <div className="border border-black/10 rounded-[14px] bg-white p-4 flex flex-col shadow-xs">
                    <h2 className="text-[11px] font-bold text-[#6b6a66] uppercase tracking-wider mb-3">
                        Active Encounters
                    </h2>

                    <div className="space-y-1.5 flex-1">
                        {encounters.map((encounter) => (
                            <div key={encounter.encounterId} className="flex items-center justify-between p-2 rounded-[10px] bg-white border border-black/[0.04]">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-mono text-[#6b6a66] w-14">
                                        {encounter.token}
                                    </span>
                                    <span className="text-[13px] font-semibold text-[#1a1a18]">
                                        {encounter.patientName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    {encounter.status === "ACKNOWLEDGED" && (
                                        <span className="text-[11px] font-medium bg-[#9FE1CB]/30 text-[#085041] px-2 py-0.5 rounded-full border border-[#9FE1CB]/50">
                                            {encounter.status}
                                        </span>
                                    )}
                                    {encounter.status === "COMPLETED" && (
                                        <span className="text-[11px] font-medium bg-[#f4f3f0] text-[#6b6a66] px-2 py-0.5 rounded-[6px] border border-black/[0.04]">
                                            Completed
                                        </span>
                                    )}

                                    {encounter.status === "ACKNOWLEDGED" && (
                                        <button
                                            disabled={isUpdatingEncounter}
                                            onClick={() =>
                                                updateActiveEncounter(encounter)
                                            }
                                            className="border border-black/10 hover:border-black/20 text-[#1a1a18] text-[11px] font-semibold px-2.5 py-1 rounded-[6px] bg-white shadow-xs transition-colors">
                                            Discharge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 bg-[#f4f3f0]/60 rounded-[8px] p-2 flex items-start gap-1.5 border border-black/[0.02]">
                        <Info size={12} className="text-[#6b6a66] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#6b6a66] leading-tight">
                            Active encounters flag after 1 day for review.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}