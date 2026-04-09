import React from 'react';

const POLICY_DATA = [
    { label: 'Sum Assured', value: '₹1,00,00,000 (1 Crore)' },
    { label: 'Policy Number', value: 'PL-2026-00412873' },
    { label: 'Policy Term', value: '30 Years' },
    { label: 'Premium', value: '₹12,500' },
    { label: 'Premium Payment Term', value: '30 Years' },
    { label: 'Premium Frequency', value: 'Annual' },
    { label: 'Nominee', value: 'Priya Sharma (Spouse)' },
];

export default function PolicyDetailsScreen() {
    return (
        <div id="policy-details-screen" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-3 overflow-y-auto" id="policy-details-main">
                <p className="text-black text-center mb-2" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                    Please confirm if policy details are correct
                </p>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm overflow-hidden mb-3">
                    <div className="bg-[#003d6b] text-white text-center py-2.5 font-bold tracking-wide" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Your Policy at a Glance
                    </div>
                    <div className="divide-y divide-gray-100">
                        {POLICY_DATA.map((d, i) => (
                            <div key={i} className="flex px-3 py-2.5" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                <span className="font-semibold text-gray-700 w-[40%] shrink-0">{d.label}</span>
                                <span className="text-gray-900 text-right flex-1">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 w-[80%] max-w-xs">
                    <div id="btn-policy-confirm" className="welcome-btn welcome-btn-filled kpw-action-button flex-1 text-center">
                        Correct
                    </div>
                    <div id="btn-policy-no" className="welcome-btn welcome-btn-outline kpw-action-button flex-1 text-center">
                        Incorrect
                    </div>
                </div>
            </div>

            <div id="policy-wrong-card" className="welcome-screen-layout" style={{ display: 'none' }}>
                <div className="screen-container">
                    <div className="welcome-card">
                        <p className="welcome-subtitle" style={{ marginBottom: 'calc(3 * var(--pw))' }}>
                            Please call 1800-102-7070<br />to correct your details.
                        </p>
                        <a href="tel:18001027070" className="nav-btn nav-btn-active kpw-action-button flex justify-center items-center gap-2" style={{ textDecoration: 'none', width: '80%', margin: '0 auto' }}>
                            Call Now
                        </a>
                        <p className="consent-text" style={{ marginTop: 'calc(3 * var(--pw))' }}>
                            We will assist you through this process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
