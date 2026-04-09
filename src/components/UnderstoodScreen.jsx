import React from 'react';

export default function UnderstoodScreen() {
    return (
        <div id="understood-screen" className="overlay-content">
            <button
                className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[160px]"
                data-action="understood"
            >
                I Understood
            </button>
        </div>
    );
}
