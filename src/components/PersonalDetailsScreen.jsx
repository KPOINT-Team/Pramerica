import React from 'react';

const DETAILS = [
    { label: 'Name', value: 'Rahul Sharma' },
    { label: 'Date of Birth', value: '29.10.1985' },
    { label: 'Mobile Number', value: '9857230087' },
    { label: 'Email', value: 'rsharma29@gmail.com' },
    { label: 'Address', value: '5B Serene Apartments, 17, Colaba, Mumbai - 400001' },
    { label: 'Nominee', value: 'Priya Sharma' },
];

export default function PersonalDetailsScreen() {
    return (
        <div id="personal-details-screen" style={{ display: 'none' }}>
            <div style={{ gap: "calc(4 * var(--pw))"}} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-2 overflow-y-auto" id="personal-details-main">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm overflow-hidden mb-2">
                    <div className="bg-[#003d6b] text-white text-center py-2.5 font-bold tracking-wide" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Your Personal Details
                    </div>
                    <div className="divide-y divide-gray-100">
                        {DETAILS.map((d, i) => (
                            <div key={i} className="flex px-3 py-2.5" style={{ fontSize: 'calc(3.5 * var(--pw))', gap: "calc(4 * var(--pw))" }}>
                                <span className="font-semibold text-gray-700 w-[40%] shrink-0">{d.label}</span>
                                <span className="text-gray-900 flex-1">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-black leading-snug text-center max-w-sm mb-2" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                    <span className='font-bold'>DISCLAIMER:</span>:This policy is a life insurance product. It is not a fixed deposit, savings scheme, or recurring deposit.
                    Premium payments are subject to the terms and conditions of the policy.
                    Please read all documents carefully.
                </p>

                {/* Buttons */}
                <div className="flex gap-3 w-[80%] max-w-xs">
                    <div
                        id="btn-details-confirm"
                        className="welcome-btn welcome-btn-filled kpw-action-button flex-1 text-center"
                    >
                        Confirm
                    </div>
                    <div
                        id="btn-details-no"
                        className="welcome-btn welcome-btn-outline kpw-action-button flex-1 text-center"
                    >
                        No
                    </div>
                </div>
            </div>

            {/* Call card — shown on "No" */}
            <div id="details-wrong-card" className="welcome-screen-layout" style={{ display: 'none' }}>
                <div className="screen-container">
                    <div className="welcome-card">
                        <p className="welcome-subtitle" style={{ marginBottom: 'calc(3 * var(--pw))' }}>
                            Please call 1800-102-7070<br />to correct your details.
                        </p>
                        <a
                            href="tel:18001027070"
                            className="nav-btn nav-btn-active kpw-action-button flex justify-center items-center gap-2"
                            style={{ textDecoration: 'none', width: '80%', margin: '0 auto' }}
                        >
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
