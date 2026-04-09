import React from 'react';
import VideoPlayer from './components/VideoPlayer.jsx';

export default function App() {
    const videoId = 'gcc-5639d983-8489-48c7-8013-3da7dd96f7a3';

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black max-sm:bg-[#d4e7f3]">
            <div className="video-container">
                <VideoPlayer videoId={videoId} />
            </div>
        </div>
    );
}
