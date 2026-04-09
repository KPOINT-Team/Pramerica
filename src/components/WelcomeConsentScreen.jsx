import React from 'react';

export default function WelcomeConsentScreen() {
    return (
        <div id="welcome-consent-screen" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl py-12 mx-4 w-[92%] shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-center pointer-events-auto">
                    <p className="text-black font-medium uppercase tracking-[0.2em] mb-4" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>Welcome</p>
                    <div className="text-[#067bc0] font-bold leading-tight mb-6" style={{ fontSize: 'calc(9 * var(--pw))' }}>
                        Rahul Sharma
                    </div>
                    <div className="w-16 h-0.5 bg-[#067bc0]/30 mx-auto mb-6" />
                    <p className="text-black leading-relaxed" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        This is your Personal Guide to your<br />
                        <span className="text-black font-bold" style={{ fontSize: 'calc(4.5 * var(--pw))' }}>Pramerica Life Insurance Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
