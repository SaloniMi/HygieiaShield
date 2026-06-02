'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

// Keep the instance globally alive outside the React render cycle
let globalRecognition = null;

export default function VoiceSymptomInput({
    onTranscript,
    transcript
}) {
    const [supported, setSupported] = useState(true);
    const [localIsListening, setLocalIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const onTranscriptRef = useRef(onTranscript);

    // Keep the transcript callback fresh without re-running effects
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        // Initialize only once globally
        if (!globalRecognition) {
            globalRecognition = new SpeechRecognition();
            globalRecognition.continuous = true;
            globalRecognition.interimResults = true;
            globalRecognition.lang = 'en-IN';
        }

        // Dynamically re-bind handlers so they point to current state closures
        globalRecognition.onstart = () => {
            setLocalIsListening(true);
        };

        globalRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += text + ' ';
                } else {
                    interimTranscript += text;
                }
            }

            setLiveTranscript(interimTranscript);

            if (finalTranscript.trim()) {
                setLiveTranscript('');
                // Call the latest parent handler safely
                onTranscriptRef.current?.(finalTranscript.trim());
            }
        };

        globalRecognition.onerror = (event) => {
            if (event.error === 'aborted') return; // Ignore harmless terminations
            console.error('Speech recognition error:', event.error);
            setLocalIsListening(false);
        };

        globalRecognition.onend = () => {
            setLocalIsListening(false);
            setLiveTranscript('');
        };

    }, []);

    const handleToggleListening = () => {
        if (!globalRecognition) return;

        if (localIsListening) {
            try {
                globalRecognition.stop();
            } catch (_) { }
            setLocalIsListening(false);
        } else {
            setLiveTranscript('');
            try {
                globalRecognition.start();
            } catch (err) {
                // If it was already running or stuck, bounce it safely
                try {
                    globalRecognition.abort();
                    setTimeout(() => globalRecognition.start(), 50);
                } catch (_) { }
            }
        }
    };

    if (!supported) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                Voice input is not supported in this browser.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleToggleListening}
                className={`
                    w-full rounded-3xl border px-5 py-5 transition-all duration-200 shadow-sm text-left outline-none
                    ${localIsListening
                        ? 'border-red-200 bg-red-50'
                        : 'border-slate-200 bg-white hover:border-[#1B65B0]'
                    }
                `}
            >
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        {localIsListening && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />
                        )}

                        <div className={`relative h-12 w-12 rounded-full flex items-center justify-center
                                ${localIsListening ? 'bg-red-500' : 'bg-[#EAF3FF]'}
                        `}>
                            <Mic size={22} className={localIsListening ? 'text-white' : 'text-[#1B65B0]'} />
                        </div>
                    </div>

                    <div className="flex-1">
                        <p className={`font-semibold ${localIsListening ? 'text-red-600' : 'text-slate-900'}`}>
                            {localIsListening ? 'Listening...' : 'Describe symptoms aloud'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {localIsListening ? 'Speak naturally. Tap again when finished.' : 'Tap once to start speaking'}
                        </p>
                    </div>
                </div>
            </button>

            {(localIsListening || liveTranscript) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Live transcript
                    </div>
                    <p className="min-h-[24px] text-sm text-slate-700">
                        {liveTranscript || 'We can hear you. Your words will appear here.'}
                    </p>
                </div>
            )}

            {transcript && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Recorded symptoms
                    </div>
                    <p className="text-sm text-slate-700">{transcript}</p>
                </div>
            )}
        </div>
    );
}