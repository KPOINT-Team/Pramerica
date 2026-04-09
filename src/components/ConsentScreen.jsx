import React from 'react';

export default function ConsentScreen() {
    return (
        <div id="consent-screen" className="overlay-content">
            <div className="flex gap-3">
                <button
                    className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[120px]"
                    data-action="agree"
                >
                    I Agree
                </button>
                <button
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[120px]"
                    data-action="disagree"
                >
                    Disagree
                </button>
            </div>
        </div>
    );
}
