"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PulseOpsLoader from '@/components/Loader';
import PatientsDashboard from '@/components/PatientsDashboard';
import PulseOpsHeader from '@/components/PulseOpsHeader';
import ShiftCoordinatorDashboard from '@/components/ShiftCoordinatorDashboard';

export default function PulseOpsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [facility, setFacility] = useState(null);
  const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

  useEffect(() => {
    // 1. Define the async function inside the effect
    const fetchFacilityData = async () => {
      try {
        const response = await fetch(`${API_GATEWAY}/pulse-ops/facility`);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        setFacility(data);
      } catch (error) {
        console.error("Error fetching facility details:", error);
        // Optional: Add an error state handler here if needed (e.g., setError(error.message))
      }
    };

    // 2. Execute it immediately
    fetchFacilityData();
  }, []);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <PulseOpsLoader />
    );
  }

  if (status === "unauthenticated") {
    return null;
  }


  if (session?.user?.role === "coordinator") {
    return (
      <div className="h-screen flex flex-col bg-[#f4f3f0] text-[#1a1a18] overflow-hidden font-sans">
        <PulseOpsHeader hospitalName={facility?.name} />
        <ShiftCoordinatorDashboard facilityId={facility?.id} />
      </div>
    )
  } else {
    return (
      <div className="h-screen flex flex-col bg-[#f4f3f0] text-[#1a1a18] overflow-hidden font-sans">
        <PulseOpsHeader hospitalName={facility?.name} />
        <PatientsDashboard facility={facility} />
      </div>
    )
  }

}