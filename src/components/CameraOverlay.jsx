import React from 'react';

export default function CameraOverlay() {
    return (
        <div id="camera-overlay" className="camera-overlay">
            <video id="camera-feed" className="camera-feed" autoPlay playsInline muted />
            <div className="absolute bottom-[3%] left-0 right-0 flex justify-center px-4">
                <button
                    className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[180px]"
                    id="record-btn"
                    data-action="start-recording"
                >
                    Start Recording
                </button>
            </div>
        </div>
    );
}
