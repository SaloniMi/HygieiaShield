'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [staffId, setStaffId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const res = await signIn('credentials', {
            redirect: false,
            staffId,
            password
        });

        setIsLoading(false);

        if (res?.error) {
            setError(res.error || 'Invalid credentials');
            return;
        }

        router.push('/');
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f3f0] font-sans antialiased text-[#1a1a18]">
            <div className="w-full max-w-[400px] bg-white border border-black/10 rounded-[14px] shadow-sm overflow-hidden">

                {/* Branding Header Banner */}
                <div className="bg-[#042C53] px-6 py-5 text-white">
                    <div className="text-base font-bold tracking-[-0.3px] text-white">
                        PulseOps
                    </div>
                    <div className="text-[11px] text-[#b5d4f4] mt-1">
                        Welcome · Clinical Workstation Secure Login
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#6b6a66] uppercase tracking-[0.5px] mb-1.5">
                            Staff ID
                        </label>
                        <input
                            type="text"
                            className="w-full bg-[#f8f7f4] border border-black/10 rounded-[8px] px-3 py-2 text-[12px] text-[#1a1a18] outline-none transition focus:border-[#378add]"
                            placeholder="Enter your credential ID..."
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#6b6a66] uppercase tracking-[0.5px] mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full bg-[#f8f7f4] border border-black/10 rounded-[8px] px-3 py-2 text-[12px] text-[#1a1a18] outline-none transition focus:border-[#378add]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Authentication Error Feedback */}
                    {error && (
                        <div className="bg-[#fcebeb] border border-[#f7c1c1] rounded-[10px] px-3 py-2.5 flex items-start gap-2">
                            <span className="text-[#a32d2d] font-bold text-[12px]">⚠️</span>
                            <div className="text-[12px] text-[#a32d2d] leading-normal font-medium">
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-[#0c447c] hover:bg-[#042c53] text-white text-[12px] font-semibold px-4 py-2.5 rounded-[10px] transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign in →'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Notice */}
                <div className="px-6 py-3 bg-[#f8f7f4] border-t border-black/5 text-center text-[11px] text-[#9a9994] italic">
                    Authorized clinical staff use only. Transactions are monitored.
                </div>
            </div>
        </div>
    );
}