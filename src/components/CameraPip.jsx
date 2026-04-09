import React from 'react';

export default function CameraPip() {
    return (
        <div id="camera-pip" className="camera-pip">
            <div className="recording-badge">
                <span className="recording-badge-dot"></span>
                <span>REC</span>
            </div>
            <video id="camera-pip-feed" autoPlay playsInline muted />
        </div>
    );
}
