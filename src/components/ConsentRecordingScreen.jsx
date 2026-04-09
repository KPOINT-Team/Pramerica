import React from 'react';

export default function ConsentRecordingScreen() {
    return (
        <div id="consent-recording-screen" style={{ display: 'none' }}>
            <div className="welcome-screen-layout" id="consent-recording-main">
                <div className="welcome-text-block">
                    <div className="welcome-title">Welcome,<br />Rahul Sharma!</div>
                    <p className="welcome-subtitle">
                        This is your Personal Guide to your Pramerica Life Insurance Policy
                    </p>
                </div>

                <div className="welcome-bottom-block">
                    <div className="consent-checkbox-row flex" id="consent-recording-label">
                        <input type="checkbox" className="consent-checkbox" id="consent-recording-check" />
                        <span className="consent-text">
                            I agree to this session being recorded for compliance purposes, as mandated by IRDAI. This recording is for my protection.
                        </span>
                    </div>

                    <div className="welcome-btn-row">
                        <div
                            id="btn-recording-agree"
                            className="welcome-btn welcome-btn-filled welcome-btn-disabled"
                        >
                            Agree
                        </div>
                        <div
                            id="btn-recording-disagree"
                            className="welcome-btn welcome-btn-outline"
                        >
                            Disagree
                        </div>
                    </div>
                </div>
            </div>
            <div id="recording-disagree-card" className="welcome-screen-layout" style={{ display: 'none' }}>
                <div className="screen-container">
                    <div className="welcome-card">
                        <p className="welcome-subtitle" style={{ marginBottom: 'calc(3 * var(--pw))' }}>
                            Please call 1800-102-7070
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
