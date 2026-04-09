import React from 'react';

export default function SessionEndCall() {
    return (
        <div id="session-end-call" style={{ display: 'none' }}>
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
                        📞 Call Now
                    </a>
                    <p className="consent-text" style={{ marginTop: 'calc(3 * var(--pw))' }}>
                        We will assist you through this process.
                    </p>
                </div>
            </div>
        </div>
    );
}
