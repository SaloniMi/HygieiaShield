'use client';

/**
 * AgentTraceTab
 * Monospace dark terminal showing a segregated 3-agent log trace without timestamps,
 * styled to match the dark slate code terminal specified in the HTML mockup.
 */
export default function AgentTraceTab({ trace, patientToken = 'LION-4821' }) {

    const colorizeAndSegregateTrace = (text) => {
        if (!text) return [];

        // Split text by lines to process entry points cleanly
        const lines = text.split('\n');

        return lines.map((line, idx) => {
            let processedLine = line.trim();

            // Regex to strip timestamp patterns if present (e.g., "[10:52]", "11:06")
            processedLine = processedLine.replace(/^\[\d{2}:\d{2}\]\s*/, '');
            processedLine = processedLine.replace(/^\d{2}:\d{2}\s*/, '');

            // Match mockup color tokens directly
            let textColor = '#8b949e'; // Default muted gray (.agent-log)
            let fontWeight = 'normal';

            if (processedLine.startsWith('→ ALERT:') || processedLine.includes('CRITICAL')) {
                textColor = '#f85149'; // Mockup .log-warn red
                fontWeight = '700';
            } else if (processedLine.startsWith('→ FLAG:') || processedLine.includes('threshold')) {
                textColor = '#f85149'; // Mockup .log-warn styling
                fontWeight = '700';
            } else if (processedLine.startsWith('→') || processedLine.includes('PASS')) {
                textColor = '#3fb950'; // Mockup .log-ok green
            } else if (processedLine.startsWith('Agent 1') || processedLine.startsWith('Agent 2') || processedLine.startsWith('Agent 3')) {
                textColor = '#79c0ff'; // Mockup .log-info blue
            }

            return (
                <div
                    key={idx}
                    style={{ color: textColor, fontWeight: fontWeight }}
                    className="font-mono text-[11px] leading-[1.8] whitespace-pre-wrap break-words"
                >
                    {processedLine}
                </div>
            );
        });
    };

    return (
        <div className="p-4 space-y-3">
            {/* Section Header Matching Mockup Typography */}
            <div className="text-[11px] font-bold text-[#9a9994] uppercase tracking-wider">
                HygieiaCore agent trace — {patientToken}
            </div>

            {/* Dark Mode Code Terminal Screen */}
            <div className="bg-[#0d1117] border border-black/10 rounded-[10px] p-[12px_14px] overflow-y-auto max-h-[380px] space-y-1">
                {colorizeAndSegregateTrace(trace)}
            </div>

            {/* Structured Legend Panel matching Workflow Palette */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f8f7f4] border border-black/10 rounded-[8px] p-2.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#79c0ff]" />
                    <span>Agent Systems</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3fb950]" />
                    <span>Passing / Extraction</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#f85149]" />
                    <span>Code Gatekeeper Flags</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6b6a66]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#8b949e]" />
                    <span>Context Inputs</span>
                </div>
            </div>
        </div>
    );
}