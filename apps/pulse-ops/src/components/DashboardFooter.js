'use client';

/**
 * DashboardFooter
 * Acknowledge & Proceed button and HygieiaShield verified stamp
 */
export default function DashboardFooter({
    onAcknowledge,
    isDisabled = true,
    acknowledgePermissionAllowed = true,
    isAcknowledged = false,
}) {
    return (
        <div className="px-[16px] py-[12px] border-t border-black/10 flex items-center bg-white">

            {acknowledgePermissionAllowed && (
                <button
                    onClick={onAcknowledge}
                    disabled={isDisabled || isAcknowledged}
                    className={`px-[16px] py-[8px] border rounded-[10px] text-[12px] font-semibold text-white ${isAcknowledged
                        ? 'bg-[#085041] border-[#085041] opacity-90'
                        : 'bg-[#0F6E56] border-[#0F6E56] hover:bg-[#085041]'
                        }`}
                >
                    {isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge & proceed'}
                </button>
            )}

            <div className="ml-auto flex items-center gap-[5px] text-[11px] text-[#0F6E56] font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[14px] h-[14px]" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path>
                    <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                    <path d="M12 12l0 2.5"></path>
                </svg>
                HygieiaCore verified
            </div>
        </div>
    );
}
