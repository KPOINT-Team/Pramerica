import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer.jsx';
import LoginPage from './components/LoginPage.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { getUserId } from './services/authService.js';

function AppContent() {
    const { authed, statusMsg } = useAuth();
    const videoId = 'gcc-5639d983-8489-48c7-8013-3da7dd96f7a3';
    const [playerReady, setPlayerReady] = useState(false);

    if (!authed && authed !== null) return <LoginPage />;

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black max-sm:bg-[#d4e7f3]">
            <div className="video-container">
                {/* Always mount VideoPlayer once authed, but hide until ready */}
                {authed && (
                    <div style={{ opacity: playerReady ? 1 : 0 }} className="w-full h-full">
                        <VideoPlayer videoId={videoId} onReady={() => setPlayerReady(true)} userId={getUserId()} />
                    </div>
                )}

                {/* Overlay splash until player is ready or still checking auth */}
                {(!authed || !playerReady) && (
                    <div className="absolute inset-0 z-[9999] bg-[#d4e7f3] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#0066b3]/15 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-9 h-9 text-[#0066b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-[#003d6b] text-xl font-semibold mb-3">Video KYC</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-[#0066b3]/30 border-t-[#0066b3] rounded-full animate-spin" />
                            <p className="text-[#003d6b]/60 text-sm">{statusMsg || 'Loading player...'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
