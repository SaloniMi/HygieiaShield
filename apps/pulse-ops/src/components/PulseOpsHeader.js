"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function PulseOpsHeader({ hospitalName = "" }) {
    const { data: session } = useSession();

    // Dynamically derive initials from user session name or fall back to "U"
    const getInitials = () => {
        if (!session?.user?.name) return "U";
        return session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="h-[48px] bg-white border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between px-5 select-none font-sans">
            {/* Left Section: Logo */}
            <div className="flex items-center">
                <h1 className="text-[16px] font-bold text-[#0C447C] tracking-[-0.3px]">
                    PulseOps
                </h1>
            </div>

            {/* Middle Section: Hospital Metadata */}
            <div className="text-[12px] text-[#6b6a66]">
                {hospitalName}
            </div>

            {/* Right Section: Surge Status & Authentication */}
            <div className="flex items-center gap-[10px]">

                {/* Session Action Info */}
                {session?.user ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#6b6a66] font-medium">
                            {session.user.name ?? session.user.staffId}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-[12px] font-semibold text-[#185FA5] hover:underline"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="text-[12px] font-semibold text-[#185FA5] hover:underline"
                    >
                        Sign in
                    </button>
                )}

                {/* Profile Avatar Frame */}
                <div className="w-[30px] h-[30px] rounded-full bg-[#E6F1FB] flex items-center justify-center text-[12px] font-bold text-[#0C447C]">
                    {getInitials()}
                </div>
            </div>
        </header>
    );
}