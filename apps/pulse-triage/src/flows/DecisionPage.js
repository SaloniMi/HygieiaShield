'use client';
import ScreenTitle from '@/components/calm-ui/common/ScreenTitle';
import Button from '@/components/web-components/Button';
import { ICONS } from '@/styles/icons';

import dynamic from "next/dynamic";

// Importing this dynamically to avoid serverside rendering of the leaflet
// which causes failures
const HospitalInfoCard = dynamic(
    () => import("@/components/calm-ui/routing-decision/HospitalInfoCard"),
    { ssr: false }
);

export default function DecisionPage({ data }) {
    const { decision } = data ?? {};
    const Icon = ICONS['location'];

    const handleOpenMap = () => {
        const from = data?.location;
        const to = decision?.recommendedFacility;

        if (!from || !to) return;

        const url =
            `https://www.google.com/maps/dir/?api=1` +
            `&origin=${from.lat},${from.lng}` +
            `&destination=${to.latitude},${to.longitude}` +
            `&travelmode=driving`;

        window.open(url, '_blank');
    };

    const getTitle = (careType) => {
        if (careType === "ER") {
            return "Go to ER"
        } else if (careType === "UrgentCare") {
            return "Go to Urgent Care"
        } else if (careType === "OutPatient") {
            return "Go to Out Patient Clinic"
        }
    }

    return (
        <div className="space-y-6">

            <ScreenTitle
                title={getTitle(decision.careType)}
                subtitle="Routing complete."
                badgeLabel={decision.patientStatus.tag}
                badgeStatus={decision.patientStatus.status}
            />

            {/* ER Recommendation */}
            <HospitalInfoCard data={data} />
            <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={handleOpenMap}
            >
                <span className="mr-1 inline-flex items-center gap-2">
                    <Icon
                        size={18}
                    />
                    Open in Maps
                </span>
            </Button>
        </div>
    );
}