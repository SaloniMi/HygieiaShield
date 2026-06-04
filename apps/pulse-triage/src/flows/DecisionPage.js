'use client';
import ScreenTitle from '@/components/calm-ui/common/ScreenTitle';
import HospitalInfoCard from '@/components/calm-ui/routing-decision/HospitalInfoCard';
import PulseTriageLoader from '@/components/web-components/Loader';


export default function DecisionPage({ data }) {
    const { decision } = data ?? {};

    if (!decision) {
        return (
            <PulseTriageLoader />
        );
    }

    return (
        <div className="space-y-6">

            <ScreenTitle
                title={decision.title}
                subtitle={decision.subtitle}
                badgeLabel={decision.badgeLabel}
                badgeStatus={decision.badgeStatus}
            />

            {/* ER Recommendation */}
            <HospitalInfoCard data={data} />
        </div>
    );
}