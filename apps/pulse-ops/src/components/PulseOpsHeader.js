import React from "react";

export default function PulseOpsHeader({
    hospitalName = ""
}) {
    return (
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center">
                <h1 className="text-[17px] font-bold text-[#0B3A6E]">
                    PulseOps
                </h1>
            </div>

            <div className="text-[12px] font-medium text-gray-600">
                {hospitalName ?? "St. Mary"}
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0B3A6E] font-semibold">
                    PR
                </div>
            </div>
        </header>
    );
}