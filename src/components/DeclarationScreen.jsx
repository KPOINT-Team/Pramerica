import React from 'react';

const DECLARATION_TEXT = "I, Rahul Sharma, confirm that I am purchasing a life insurance policy from Pramerica Life Insurance. I acknowledge that this is not a fixed deposit or savings scheme. I agree to pay a premium of ₹12,500 annually.";

export default function DeclarationScreen() {
    return (
        <div id="declaration-screen" style={{ display: 'none' }}>
            <style>{`
                @keyframes pulseOpacityA { 0%,100% { opacity: 0.9; } 50% { opacity: 0.6; } }
                @keyframes pulseOpacityB { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
            `}</style>
            <div className="absolute inset-0 flex flex-col justify-center pointer-events-auto px-3 py-3 overflow-y-auto" id="declaration-main">

                {/* Title */}
                <h2 className="text-[#0066b3] font-semibold mb-2 mt-8" style={{ fontSize: 'calc(5 * var(--pw))' }}>
                    Declaration
                </h2>

                {/* Declaration text card */}
                <div className="bg-[#e8eef3] rounded-xl p-2">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        {DECLARATION_TEXT}
                    </p>
                </div>
                {/* Review label */}
                <div id="declaration-review-label" className="flex items-center gap-2 mt-4 mb-2" style={{ display: 'none' }}>
                    <span className="text-gray-600 font-medium" style={{ fontSize: 'calc(3 * var(--pw))' }}>Review your speech:</span>
                </div>

                {/* Live transcript */}
                <div id="declaration-transcript-box" className="bg-blue-50 border border-blue-200 rounded-lg p-2 overflow-y-auto" style={{ display: 'none', maxHeight: 'calc(30 * var(--pw))' }}>
                    <p id="declaration-transcript" className="text-blue-800 text-center" style={{ fontSize: 'calc(3 * var(--pw))' }}></p>
                </div>

                {/* Mic status — disabled by default */}
                <div id="declaration-mic-waiting" className="flex items-center gap-2 mt-4 mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 shrink-0">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                    <span className="text-gray-500 italic" style={{ fontSize: 'calc(3 * var(--pw))' }}>Mic will be active shortly</span>
                </div>

                {/* Listening state — hidden initially */}
                <div id="declaration-listening" className="flex items-center gap-2 mt-4 mb-2" style={{ display: 'none' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003d6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 animate-[pulseOpacityA_1.2s_ease-in-out_infinite]">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                    <span className="text-gray-700 font-medium animate-[pulseOpacityB_1.2s_ease-in-out_infinite]" style={{ fontSize: 'calc(3 * var(--pw))' }}>Recording...</span>
                </div>

                

                

                {/* Error message */}
                <p id="declaration-message" className="text-center mb-1" style={{ fontSize: 'calc(3 * var(--pw))', minHeight: 'calc(4 * var(--pw))' }}>&nbsp;</p>
                 
                 <p id="declaration-hint" className="text-gray-500  mb-1" style={{ fontSize: 'calc(3 * var(--pw))', display: 'none' }}>
                    Please Tap the <strong>Button</strong> below, after <strong>speaking</strong>
                </p>
                {/* Button — disabled until recording starts */}
                <div id="btn-declaration-done" className="w-full bg-[#003d6b] text-white py-2 rounded-xl text-center cursor-not-allowed opacity-80 mb-2" style={{ fontSize: 'calc(4 * var(--pw))', pointerEvents: 'none' }}>
                    I have Read the Statement above
                </div>

                {/* Review buttons — hidden initially */}
                <div id="declaration-review-buttons" className="flex gap-2 mb-2" style={{ display: 'none' }}>
                    <div id="btn-declaration-retry" className="flex-1 bg-gray-200 text-gray-800  py-2 rounded-xl text-center cursor-pointer hover:bg-gray-300" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Retry
                    </div>
                    <div id="btn-declaration-continue" className="flex-1 bg-[#003d6b] text-white  py-2 rounded-xl text-center cursor-pointer hover:bg-[#002d52]" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Continue
                    </div>
                </div>
            </div>
        </div>
    );
}
