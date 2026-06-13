'use client';

import { useEffect, useState } from 'react';
import ScreenTitle from '@/components/calm-ui/common/ScreenTitle';
import SymptomGrid from '@/components/calm-ui/symptom-intake-flow/SymptomGrid';
import Button from '@/components/web-components/Button';
import VoiceSymptomInput from '@/components/calm-ui/symptom-intake-flow/VoiceInput';
import Divider from '@/components/web-components/Divider';
import Badge from '@/components/web-components/Badge'
import PulseTriageLoader from '@/components/web-components/Loader';


export default function Step2Page({
    data,
    setData,
    onNext,
}) {
    const [locationStatus, setLocationStatus] = useState('idle');
    // idle | requesting | granted | denied

    const hasSymptoms = data?.symptoms?.selections?.length > 0 || (data?.symptoms?.transcript?.length > 0);
    const continueDisabled =
        !hasSymptoms || locationStatus !== 'granted';

    useEffect(() => {
        if (!data?.location?.lat || !data?.location?.lng) return;

        let cancelled = false;

        async function fetchAddress() {
            try {
                const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

                const res = await fetch(
                    `${API_GATEWAY}/location/reverse-geocode?lat=${data.location.lat}&lng=${data.location.lng}`
                );

                const json = await res.json();

                if (!cancelled) {
                    setData((prev) => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            address: json.address,
                        },
                    }));
                }
            } catch (e) {
                console.debug(e)
                // fallback silently
            }
        }

        fetchAddress();

        return () => {
            cancelled = true;
        };
    }, [data?.location?.lat, data?.location?.lng, setData]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            return;
        }

        const MAX_RETRIES = 3;
        let attempts = 0;
        let cancelled = false;

        const getLocation = () => {
            if (cancelled) return;

            setLocationStatus('requesting');

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (cancelled) return;

                    setData((prev) => ({
                        ...prev,
                        location: {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            address: null
                        },
                    }));

                    setLocationStatus('granted');
                },
                () => {
                    if (cancelled) return;

                    attempts += 1;

                    // Retry if under limit
                    if (attempts < MAX_RETRIES) {
                        setTimeout(() => {
                            getLocation();
                        }, 1000 * attempts); // small backoff (1s, 2s, 3s)
                    } else {
                        setLocationStatus('denied');
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 50000,
                    maximumAge: 0,
                }
            );
        };

        getLocation();

        return () => {
            cancelled = true;
        };
    }, [setData]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinue = async () => {
        if (continueDisabled || isSubmitting) return;

        try {
            setIsSubmitting(true);

            const start = Date.now();
            const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
            const response = await fetch(`${API_GATEWAY}/pulse-triage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: data,
                    trace: {}
                })
            });

            if (!response.ok) {
                throw new Error('Triage request failed');
            }

            const result = await response.json();

            setData((prev) => ({
                ...prev,
                decision: result.data,
            }));

            window.scrollTo({ top: 0, behavior: 'smooth' });
            onNext();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const locationLabel =
        data?.location
            ? data.location.address ?? "Location Detected"
            : 'Detecting location...';

    // if (isSubmitting) {
    //     return <PulseTriageLoader />;
    // }
    return (
        <>
            {isSubmitting && (
                <PulseTriageLoader />
            )}
            <div className="space-y-6">
                {/* <ScreenTitle
                    title="What are the symptoms?"
                    subtitle="Select all that apply, or describe in your own words."
                /> */}
                <div className="flex items-start justify-between gap-3">
                    <ScreenTitle
                        title="What are the symptoms?"
                        subtitle="Select all that apply, or describe in your own words."
                    />

                    <div className="pt-1">
                        {locationStatus === 'requesting' && (
                            <Badge variant="info" isLoading>
                                Locating
                            </Badge>
                        )}

                        {locationStatus === 'granted' && (
                            <Badge variant="success" icon="location">
                                {locationLabel}
                            </Badge>
                        )}

                        {locationStatus === 'denied' && (
                            <Badge variant="error">
                                Location blocked
                            </Badge>
                        )}
                    </div>
                </div>


                <div className="space-y-5">

                    <VoiceSymptomInput
                        transcript={data?.symptoms?.transcript || ''}
                        onTranscript={(text) => {
                            setData((prev) => {
                                const existing = prev?.symptoms?.transcript || '';
                                const cleanText = text.trim();
                                if (!cleanText) return prev;

                                const separator = existing ? (existing.endsWith('.') ? ' ' : '. ') : '';
                                return {
                                    ...prev,
                                    symptoms: {
                                        ...prev.symptoms,
                                        transcript: `${existing}${separator}${cleanText}`,
                                    },
                                };
                            });
                        }}
                    />



                    <Divider text="Common Symptoms" />

                    <SymptomGrid
                        value={data.symptoms.selections}
                        onChange={(selections) =>
                            setData((prev) => ({
                                ...prev,
                                symptoms: {
                                    ...prev.symptoms,
                                    selections,
                                },
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
                Find care now →
            </Button>
        </>
    );
}