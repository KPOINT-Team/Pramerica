import React from 'react';

const SUMMARY = [
    { label: 'Free Look Period', value: 'Until 31st March 2026' },
    { label: 'Premium', value: '₹12,500 annually' },
    { label: 'Helpline', value: '1800-102-7070' },
    { label: 'Website', value: 'pramericalife.in' },
];

export default function AcknowledgeScreen() {
    return (
        <div id="acknowledge-screen" style={{ display: 'none' }}>
            {/* View 1: Summary + Acknowledge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-2 overflow-y-auto" id="acknowledge-main">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm overflow-hidden mb-3">
                    <div className="bg-[#003d6b] text-white text-center py-2.5 font-bold tracking-wide" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Policy Summary
                    </div>
                    <div className="divide-y divide-gray-100">
                        {SUMMARY.map((d, i) => (
                            <div key={i} className="flex px-4 py-2.5" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                <span className="font-semibold text-gray-700 w-[45%] shrink-0">{d.label}</span>
                                <span className="text-gray-900 text-right flex-1">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-[90%] max-w-sm mb-4">
                    <p className="text-gray-700 text-center leading-relaxed" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                        I confirm that I have watched this onboarding video and understand my policy.
                    </p>
                </div>

                <div id="btn-acknowledge" className="bg-[#003d6b] text-white font-semibold text-center py-2.5 px-6 rounded-lg cursor-pointer hover:bg-[#002d52] transition-colors kpw-action-button" style={{ fontSize: 'calc(3 * var(--pw))' }}>
                    I Acknowledge
                </div>
            </div>

            {/* View 2: Rating */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-4" id="rating-view" style={{ display: 'none' }}>
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm p-6 text-center">
                    <p className="text-[#003d6b] font-bold mb-3" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        How did you like this experience?
                    </p>
                    <div className="flex justify-center gap-2 mb-4" id="star-container">
                        {[1, 2, 3, 4, 5].map(n => (
                            <span
                                key={n}
                                className="star cursor-pointer transition-colors text-gray-300 hover:text-yellow-400"
                                style={{ fontSize: 'calc(10 * var(--pw))' }}
                                data-rating={n}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <p id="rating-msg" className="text-gray-500 mb-3 min-h-4" style={{ fontSize: 'calc(3 * var(--pw))' }}>&nbsp;</p>
                    <div id="btn-submit-rating" className="welcome-btn welcome-btn-filled kpw-action-button text-center" style={{ display: 'none' }}>
                        Submit
                    </div>
                </div>
            </div>

            {/* View 3: Thank You */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-4" id="thank-you-view" style={{ display: 'none' }}>
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm p-8 text-center">
                    <p className="mb-3" style={{ fontSize: 'calc(10 * var(--pw))' }}>🎉</p>
                    <p className="text-[#003d6b] font-bold mb-2" style={{ fontSize: 'calc(5 * var(--pw))' }}>Thank You!</p>
                    <p className="text-gray-600" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                        Your onboarding is now complete.<br />
                        Welcome to the Pramerica family!
                    </p>
                </div>
            </div>
        </div>
    );
}
