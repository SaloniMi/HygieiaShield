'use client';

import { useEffect, useState } from 'react';
import ScreenTitle from '@/components/calm-ui/common/ScreenTitle';
import SymptomGrid from '@/components/calm-ui/symptom-intake-flow/SymptomGrid';
import Button from '@/components/web-components/Button';
import VoiceSymptomInput from '@/components/calm-ui/symptom-intake-flow/VoiceInput';
import Divider from '@/components/web-components/Divider';
import Badge from '@/components/web-components/Badge'


export default function Step2Page({
    data,
    setData,
    onNext,
}) {
    const [locationStatus, setLocationStatus] = useState('idle');
    // idle | requesting | granted | denied

    const hasSymptoms = data?.symptoms?.observables?.length > 0 || (data?.symptoms?.transcript?.length > 0);
    const continueDisabled =
        !hasSymptoms || locationStatus !== 'granted';

    useEffect(() => {
        if (!data?.location?.lat || !data?.location?.lng) return;

        let cancelled = false;

        async function fetchAddress() {
            try {
                const res = await fetch(
                    `/api/location/reverse-geocode?lat=${data.location.lat}&lng=${data.location.lng}`
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

    const handleContinue = () => {
        if (continueDisabled) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        onNext();
    };

    const locationLabel =
        data?.location
            ? data.location.address ?? "Location Detected"
            : 'Detecting location...';

    return (
        <>
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
                    {/* <VoiceSymptomInput
                        isListening={isListening}
                        onListeningChange={setIsListening}
                        transcript={data.symptoms.transcript}
                        onTranscript={(text) =>
                            setData((prev) => ({
                                ...prev,
                                symptoms: {
                                    ...prev.symptoms,
                                    transcript: [
                                        prev.symptoms?.transcript,
                                        text,
                                    ]
                                        .filter(Boolean)
                                        .join(' '),
                                },
                            }))
                        }
                    /> */}

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



                    <Divider text="or select below" />

                    <SymptomGrid
                        value={data.symptoms.observables}
                        onChange={(observables) =>
                            setData((prev) => ({
                                ...prev,
                                symptoms: {
                                    ...prev.symptoms,
                                    observables,
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