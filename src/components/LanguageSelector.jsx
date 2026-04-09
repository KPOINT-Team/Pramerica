import React from 'react';

const LANGUAGES = [
    { code: 'en', label: 'English', enabled: true },
    { code: 'hi', label: 'हिन्दी', enabled: false },
    { code: 'ta', label: 'தமிழ்', enabled: false },
    { code: 'te', label: 'తెలుగు', enabled: false },
    { code: 'mr', label: 'मराठી', enabled: false },
    { code: 'bn', label: 'বাংলা', enabled: false },
];

export default function LanguageSelector() {
    return (
        <div id="language-selector" style={{ display: 'none' }}>
            <div className="screen-container">
                <div className="screen-heading">Select Language</div>
                <div className="btn-container-grid p-3">
                    {LANGUAGES.map(lang => (
                        <div
                            key={lang.code}
                            id={`btn-${lang.code}`}
                            className={`nav-btn ${lang.enabled ? 'nav-btn-active kpw-action-button' : 'nav-btn-disabled'}`}
                            data-lang={lang.code}
                            data-param-key="lang"
                            data-param-value={lang.label}
                        >
                            {lang.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
