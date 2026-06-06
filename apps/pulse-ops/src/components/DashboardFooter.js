'use client';

/**
 * DashboardFooter
 * Acknowledge & Proceed button and HygieiaShield verified stamp
 */
export default function DashboardFooter({
    triageId,
    onAcknowledge,
    isLoading = false,
}) {
    return (
        <div className="border-t border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
            {/* Left: Action buttons */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onAcknowledge}
                    disabled={isLoading}
                    className="
            px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400
            text-white font-semibold rounded-lg transition-colors
            text-sm disabled:cursor-not-allowed
          "
                >
                    {isLoading ? 'Processing...' : 'Acknowledge & proceed'}
                </button>

                <button className="
          px-4 py-2.5 border border-gray-300 text-gray-700
          rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium
        ">
                    Refer to specialist
                </button>
            </div>

            {/* Right: Verified stamp */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                    ✓ HygieiaShield verified · 3 agents
                </span>
            </div>
        </div>
    );
}
