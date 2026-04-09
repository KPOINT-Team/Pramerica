import React from 'react';

export default function DocumentUpload() {
    return (
        <div id="document-upload" style={{ display: 'none' }}>
            <div className="screen-container">
                <div className="screen-heading mb-2">Upload Document</div>
                <div className="flex flex-col items-center gap-4 w-[80%]">
                    <img
                        id="upload-doc-image"
                        src="/images/aadhaar.png"
                        alt="Document"
                        className="w-full rounded-lg border border-white/20 shadow-lg"
                    />
                    <input
                        type="file"
                        id="doc-file-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div
                        id="btn-upload-doc"
                        className="nav-btn nav-btn-active kpw-action-button flex justify-center w-full"
                    >
                        Upload Document
                    </div>
                </div>
            </div>
            <div
                id="btn-proceed"
                className="nav-btn nav-btn-disabled"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', pointerEvents: 'visible' }}
            >
                Proceed
            </div>
        </div>
    );
}
