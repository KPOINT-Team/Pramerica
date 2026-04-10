import React from 'react';

const DECLARATION_TEXT = "I, Rahul Sharma, confirm that I am purchasing a life insurance policy from Pramerica Life Insurance. I acknowledge that this is not a fixed deposit or savings scheme. I agree to pay a premium of ₹12,500 annually.";

export default function DeclarationScreen() {
    return (
        <div id="declaration-screen" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-3 overflow-y-auto" id="declaration-main">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 w-[92%] max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <p className="text-[#003d6b] font-bold mb-2 text-center" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                        Read Declaration
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-gray-800 leading-relaxed text-left" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                            {DECLARATION_TEXT}
                        </p>
                    </div>

                    {/* Live transcript */}
                    <div id="declaration-transcript-box" className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2 overflow-y-auto" style={{ display: 'none', maxHeight: 'calc(20 * var(--pw))' }}>
                        <p id="declaration-transcript" className="text-blue-800 text-center" style={{ fontSize: 'calc(3 * var(--pw))' }}></p>
                    </div>

                    {/* Mic status — disabled by default, enabled when recording */}
                    <div id="declaration-mic-waiting" className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                        </span>
                        <span className="text-gray-400 font-medium" style={{ fontSize: 'calc(3 * var(--pw))' }}>Mic will activate shortly...</span>
                    </div>
                    <div id="declaration-listening" className="flex items-center justify-center gap-2 mb-3" style={{ display: 'none' }}>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-gray-600 font-medium" style={{ fontSize: 'calc(3 * var(--pw))' }}>Recording... speak now</span>
                    </div>
                    <p id="declaration-hint" className="text-gray-500 text-center mb-2" style={{ fontSize: 'calc(2.8 * var(--pw))', display: 'none' }}>
                        Tap the button below when you're finished speaking.
                    </p>
                    <div id="declaration-review-label" className="flex items-center justify-center gap-2 mb-3" style={{ display: 'none' }}>
                        <span className="text-gray-600 font-medium" style={{ fontSize: 'calc(3 * var(--pw))' }}>Review your speech:</span>
                    </div>

                    {/* Error message */}
                    <p id="declaration-message" className="text-center mb-2" style={{ fontSize: 'calc(3 * var(--pw))', minHeight: 'calc(4 * var(--pw))' }}>&nbsp;</p>

                    {/* Button — disabled until recording starts */}
                    <div id="btn-declaration-done" className="w-full bg-gray-300 text-gray-500 py-2.5 rounded-lg text-center cursor-not-allowed" style={{ fontSize: 'calc(3.5 * var(--pw))', pointerEvents: 'none' }}>
                        I Have Read the Statement
                    </div>

                    {/* Review buttons — hidden initially */}
                    <div id="declaration-review-buttons" className="flex gap-2" style={{ display: 'none' }}>
                        <div id="btn-declaration-retry" className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg text-center cursor-pointer hover:bg-gray-300" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                            Retry
                        </div>
                        <div id="btn-declaration-continue" className="flex-1 bg-[#003d6b] text-white font-semibold py-2.5 rounded-lg text-center cursor-pointer hover:bg-[#002d52]" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                            Continue
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
