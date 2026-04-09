import React from 'react';
import { Download } from 'lucide-react';

const DOWNLOADS = [
    { id: 'btn-download-policy', label: 'Policy Document', href: '/docs/policy-document.pdf' },
    { id: 'btn-download-terms', label: 'Terms & Conditions', href: '/docs/terms-conditions.pdf' },
    { id: 'btn-download-features', label: 'Key Features Document', href: '/docs/key-features.pdf' },
];

export default function DownloadsScreen() {
    return (
        <div id="downloads-screen" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-4">
                <p className="text-black font-bold text-center mb-4" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                    Download Your Documents
                </p>
                <div className="flex flex-col gap-3 w-[85%] max-w-xs">
                    {DOWNLOADS.map(doc => (
                        <div
                            key={doc.id}
                            id={doc.id}
                            className="nav-btn  text-[#042345] border-2 border-[#042345] kpw-action-button flex items-center justify-center gap-2 text-center cursor-pointer   transition-colors"
                        >
                            <Download size={16} />
                            {doc.label}
                        </div>
                    ))}
                </div>
            </div>
            <div
                id="btn-downloads-proceed"
                className="nav-btn nav-btn-active kpw-action-button"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', pointerEvents: 'auto' }}
            >
                Proceed
            </div>
        </div>
    );
}
