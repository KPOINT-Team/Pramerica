import React from 'react';

export default function ProceedScreen() {
    return (
        <div id="proceed-screen" style={{ display: 'none' }}>
            <div
                id="btn-proceed-screen"
                className="nav-btn nav-btn-active kpw-action-button"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', pointerEvents: 'visible' }}
            >
                Proceed
            </div>
        </div>
    );
}
