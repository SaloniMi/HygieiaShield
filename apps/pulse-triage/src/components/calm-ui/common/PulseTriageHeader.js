import React from "react";

export default function PulseHeader({
    title = "PulseTriage"
}) {
    return (
        <header className="w-full pt-5 pb-1 flex justify-center items-center">
            <span className="text-[17px] font-bold text-[#1e4e8c] tracking-tight">
                {title}
            </span>
        </header>
    );
}