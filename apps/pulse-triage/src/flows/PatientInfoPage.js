'use client';

import ScreenTitle from '@/components/calm-ui/common/ScreenTitle';
import PatientNameField from '@/components/calm-ui/patient-info/PatientNameField';
import AgeSelector from '@/components/calm-ui/patient-info/AgeSelector';
import Button from '@/components/web-components/Button';

export default function Step1Page({
    data,
    setData,
    onNext,
}) {
    const continueDisabled =
        !data.patientName || !data.ageGroup;

    const handleContinue = () => {
        if (continueDisabled) return;

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

        onNext();
    };

    return (
        <>
            <div className="space-y-6">
                <ScreenTitle
                    title="Who needs help?"
                    subtitle="No account needed. Your information stays private."
                />

                <div className="space-y-5">
                    <PatientNameField
                        value={data.patientName}
                        onChange={(value) =>
                            setData((prev) => ({
                                ...prev,
                                patientName: value,
                            }))
                        }
                    />

                    <AgeSelector
                        value={data.ageGroup}
                        onChange={(value) =>
                            setData((prev) => ({
                                ...prev,
                                ageGroup: value,
                            }))
                        }
                    />
                </div>
            </div>

            <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={handleContinue}
                isDisabled={continueDisabled}
            >
                Continue →
            </Button>
        </>
    );
}