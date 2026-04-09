import React from 'react';

const DOCUMENTS = [
    { id: 'btn-aadhaar', label: 'Aadhaar Card', value: 'aadhaar' },
    { id: 'btn-pan', label: 'PAN Card', value: 'pan' },
    { id: 'btn-passport', label: 'Passport', value: 'passport' },
    { id: 'btn-voterid', label: 'Voter ID', value: 'voterid' },
    { id: 'btn-dl', label: 'Driving Licence', value: 'dl' },
];

export default function DocumentSelector() {
    return (
        <div id="document-selector" style={{ display: 'none' }}>
            <div className="screen-container">
                <div className="screen-heading mb-1">Select Document</div>
                <div className="flex flex-col gap-4 w-[80%] p-2">
                    {DOCUMENTS.map(doc => (
                        <div
                            key={doc.id}
                            id={doc.id}
                            className="nav-btn nav-btn-active kpw-action-button flex justify-center"
                            data-param-key="document"
                            data-param-value={doc.value}
                        >
                            {doc.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
