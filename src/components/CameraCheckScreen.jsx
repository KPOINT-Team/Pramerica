import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CheckCircle, Circle, Loader, Mic } from 'lucide-react';
import { initFaceMesh, detectFace, isFaceCentered, checkBrightness, detectBlink, getHeadTurnRatio } from '../services/faceDetection.js';
import { initAudioAnalyser } from '../services/audioCheck.js';
import { pausePlayer, playPlayer, getPlayer } from './VideoPlayer.jsx';
import { verifySpeechText, transcribeAudio } from '../services/geminiService.js';

const EXPECTED_TEXT = "My name is Rahul Sharma and I am starting my Pramerica onboarding.";

const WAITING_MESSAGES = [
    'Setting up...',
    'Checking microphone...',
    'Preparing audio...',
    'Configuring settings...',
    'Connecting services...',
    'Verifying permissions...',
    'Loading resources...',
    'Finalizing setup...',
    'Optimizing audio...',
    'Almost ready...',
];

export default function CameraCheckScreen({ onRecordingStarted }) {
    const [phase, setPhase] = useState('setup');
    const [error, setError] = useState(null);
    const [checks, setChecks] = useState({
        faceDetected: false, wellLit: false, centered: false, matchScore: false,
    });
    const [livenessChecks, setLivenessChecks] = useState({ blinked: false, headTurned: false });
    const [audioPass, setAudioPass] = useState(false);
    const [audioError, setAudioError] = useState('');
    const [transcript, setTranscript] = useState('');
    const [audioState, setAudioState] = useState('recording'); // 'recording' | 'transcribing' | 'review' | 'verifying' | 'passed'
    const [pipMode, setPipMode] = useState(false);
    const [waitingMsgIndex, setWaitingMsgIndex] = useState(0);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const blinkCountRef = useRef(0);
    const wasBlinkingRef = useRef(false);
    const headLeftRef = useRef(false);
    const headRightRef = useRef(false);
    const nextPhaseRef = useRef(null);
    const timeUpdateBoundRef = useRef(false);
    const transcriptRef = useRef('');
    const transcriptBoxRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const audioBlobRef = useRef(null);

    const stopDetectionLoop = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    // Timeupdate listener for phase transitions
    useEffect(() => {
        if (timeUpdateBoundRef.current) return;
        const player = getPlayer();
        if (!player) return;

        timeUpdateBoundRef.current = true;
        player.addEventListener("timeupdate", function (offset) {
            if (nextPhaseRef.current === 'face-check' && offset >= 94500 && offset < 95500) {
                nextPhaseRef.current = null;
                player.pauseVideo();
                setPhase('face-check');
            }
            if (nextPhaseRef.current === 'liveness-start' && offset >= 103500 && offset < 104500) {
                nextPhaseRef.current = null;
                player.pauseVideo();
                setPhase('liveness');
            }
            if (nextPhaseRef.current === 'audio-start' && offset >= 111500 && offset < 112500) {
                nextPhaseRef.current = null;
                player.pauseVideo();
                setPhase('audio');
            }
            if (nextPhaseRef.current === 'start-recording-start' && offset >= 117500 && offset < 118500) {
                nextPhaseRef.current = null;
                player.pauseVideo();
                setPhase('start-recording');
            }
        });
    }, [phase]);

    // Setup
    useEffect(() => {
        if (phase !== 'setup') return;
        let cancelled = false;

        async function setup() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: true,
                });
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                await initFaceMesh();
                if (cancelled) return;
                await initAudioAnalyser(stream);
                setPhase('camera-on');
                nextPhaseRef.current = 'face-check';
                playPlayer();
            } catch (err) {
                if (!cancelled) setError('Camera access denied. Please allow camera and microphone permissions.');
            }
        }
        setup();
        return () => { cancelled = true; };
    }, [phase]);

    // Face quality check
    useEffect(() => {
        if (phase !== 'face-check') return;
        let allPassed = false;
        let matchTimeout = null;

        function loop() {
            if (allPassed) return;
            const video = videoRef.current;
            if (!video || video.readyState < 2) {
                animFrameRef.current = requestAnimationFrame(loop);
                return;
            }
            const result = detectFace(video, performance.now());
            setChecks(prev => {
                const updated = {
                    faceDetected: prev.faceDetected || (result?.detected ?? false),
                    wellLit: prev.wellLit || (result?.detected ? checkBrightness(video) : false),
                    centered: prev.centered || (result?.detected ? isFaceCentered(result.landmarks) : false),
                    matchScore: prev.matchScore,
                };
                if (updated.faceDetected && updated.wellLit && updated.centered && !updated.matchScore && !matchTimeout) {
                    matchTimeout = setTimeout(() => setChecks(p => ({ ...p, matchScore: true })), 2000);
                }
                if (updated.faceDetected && updated.wellLit && updated.centered && updated.matchScore) allPassed = true;
                return updated;
            });
            if (!allPassed) animFrameRef.current = requestAnimationFrame(loop);
        }
        animFrameRef.current = requestAnimationFrame(loop);
        return () => { stopDetectionLoop(); if (matchTimeout) clearTimeout(matchTimeout); };
    }, [phase]);

    // Liveness check
    useEffect(() => {
        if (phase !== 'liveness') return;
        blinkCountRef.current = 0;
        wasBlinkingRef.current = false;
        headLeftRef.current = false;
        headRightRef.current = false;

        function loop() {
            const video = videoRef.current;
            if (!video || video.readyState < 2) {
                animFrameRef.current = requestAnimationFrame(loop);
                return;
            }
            const result = detectFace(video, performance.now());
            if (result?.detected && result.blendshapes) {
                const isBlinking = detectBlink(result.blendshapes);
                if (wasBlinkingRef.current && !isBlinking) blinkCountRef.current++;
                wasBlinkingRef.current = isBlinking;
                const ratio = getHeadTurnRatio(result.landmarks);
                if (ratio < 0.35) headLeftRef.current = true;
                if (ratio > 0.65) headRightRef.current = true;
            }
            const blinked = blinkCountRef.current >= 2;
            const headTurned = headLeftRef.current && headRightRef.current;
            setLivenessChecks({ blinked, headTurned });

            if (blinked && headTurned) {
                setPipMode(true);
                setPhase('audio-waiting');
                nextPhaseRef.current = 'audio-start';
                playPlayer();
                return;
            }
            animFrameRef.current = requestAnimationFrame(loop);
        }
        animFrameRef.current = requestAnimationFrame(loop);
        return () => stopDetectionLoop();
    }, [phase]);

    // Audio check — start MediaRecorder when phase becomes 'audio'
    useEffect(() => {
        if (phase !== 'audio') return;

        // Release audio tracks from camera stream so MediaRecorder can use the mic
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.stop());
        }

        transcriptRef.current = '';
        setTranscript('');
        setAudioError('');
        setAudioState('recording');

        let cancelled = false;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
                audioStreamRef.current = stream;

                const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : '';
                const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
                mediaRecorderRef.current = mr;
                const chunks = [];
                mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
                mr.onstop = () => {
                    audioBlobRef.current = new Blob(chunks, { type: mimeType || 'audio/webm' });
                };
                mr.start();
            } catch (err) {
                setAudioError('Microphone access denied.');
            }
        })();

        return () => {
            cancelled = true;
            const mr = mediaRecorderRef.current;
            try { if (mr && mr.state !== 'inactive') mr.stop(); } catch (e) {}
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(t => t.stop());
            }
            mediaRecorderRef.current = null;
            audioStreamRef.current = null;
            audioBlobRef.current = null;
        };
    }, [phase]);

    // Cycle waiting messages every 1 second during audio-waiting phase
    useEffect(() => {
        if (phase !== 'audio-waiting') return;
        setWaitingMsgIndex(0);
        const interval = setInterval(() => {
            setWaitingMsgIndex(prev => (prev + 1) % WAITING_MESSAGES.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [phase]);

    // Auto-scroll transcript box
    useEffect(() => {
        if (transcriptBoxRef.current) {
            transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
        }
    }, [transcript]);

    const startNewRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : MediaRecorder.isTypeSupported('audio/mp4')
                ? 'audio/mp4'
                : '';
            const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = mr;
            const chunks = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mr.onstop = () => {
                audioBlobRef.current = new Blob(chunks, { type: mimeType || 'audio/webm' });
            };
            mr.start();
        } catch (e) {
            setAudioError('Microphone access denied.');
        }
    };

    const handleAudioDone = async () => {
        const mr = mediaRecorderRef.current;
        if (!mr || mr.state === 'inactive') return;

        setAudioState('transcribing');
        setAudioError('');

        await new Promise((resolve) => {
            mr.addEventListener('stop', resolve, { once: true });
            try { mr.stop(); } catch (e) { resolve(); }
        });

        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
        }

        const blob = audioBlobRef.current;
        if (!blob || blob.size === 0) {
            setAudioError('No audio captured. Please try again.');
            setAudioState('recording');
            await startNewRecording();
            return;
        }

        try {
            const mimeType = blob.type || 'audio/webm';
            const spoken = await transcribeAudio(blob, mimeType);
            if (!spoken) {
                setAudioError('No speech detected. Please try again.');
                setAudioState('recording');
                await startNewRecording();
                return;
            }
            setTranscript(spoken);
            transcriptRef.current = spoken;
            setAudioState('review');
        } catch (err) {
            setAudioError('Transcription failed. Please try again.');
            setAudioState('recording');
            await startNewRecording();
        }
    };

    const handleAudioRetry = async () => {
        setTranscript('');
        transcriptRef.current = '';
        setAudioError('');
        setAudioState('recording');
        await startNewRecording();
    };

    const handleAudioContinue = async () => {
        setAudioState('verifying');
        setAudioError('');

        try {
            const passed = await verifySpeechText(transcriptRef.current, EXPECTED_TEXT);
            if (passed) {
                setAudioPass(true);
                setAudioState('passed');
                setPhase('start-recording-waiting');
                nextPhaseRef.current = 'start-recording-start';
                playPlayer();
            } else {
                setAudioError('Text did not match. Please retry.');
                setAudioState('review');
            }
        } catch (err) {
            setAudioError('Verification failed. Please try again.');
            setAudioState('review');
        }
    };

    const handleContinue = () => {
        setPhase('liveness-waiting');
        nextPhaseRef.current = 'liveness-start';
        playPlayer();
    };

    const handleStartRecording = () => {
        setPhase('done');
        if (onRecordingStarted) onRecordingStarted(streamRef.current);
    };

    const handleRetry = () => { setError(null); setPhase('setup'); };

    const allFaceChecksPassed = checks.faceDetected && checks.wellLit && checks.centered && checks.matchScore;
    const showFullScreen = !pipMode && phase !== 'done';
    const showPip = pipMode && phase !== 'done';
    const showLivenessCard = phase === 'liveness-waiting' || phase === 'liveness';
    const showAudioCard = phase === 'audio-waiting' || phase === 'audio';
    const showStartRecCard = phase === 'start-recording-waiting' || phase === 'start-recording';
    const livenessActive = phase === 'liveness';
    const audioActive = phase === 'audio';

    const CheckItem = ({ passed, checking, label }) => (
        <div className="flex items-center gap-2 py-1.5">
            {passed
                ? <CheckCircle size={18} className="text-green-500" />
                : checking
                    ? <Circle size={18} className="text-green-400 animate-pulse" />
                    : <Circle size={18} className="text-gray-300" />
            }
            <span className={`font-medium ${passed ? 'text-green-700' : checking ? 'text-gray-600' : 'text-gray-400'}`} style={{ fontSize: 'calc(3.5 * var(--pw))' }}>{label}</span>
        </div>
    );

    if (error) {
        return (
            <div id="camera-check-screen" className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-black/80 px-6 z-[1002]">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
                    <Camera size={32} className="text-red-500 mx-auto mb-3" />
                    <p className="text-gray-900 font-semibold mb-2" style={{ fontSize: 'calc(4 * var(--pw))' }}>Camera Access Required</p>
                    <p className="text-gray-500 mb-4" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>{error}</p>
                    <button onClick={handleRetry} className="bg-[#003d6b] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#002d52] transition-colors cursor-pointer" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="camera-check-screen" className="absolute inset-0 pointer-events-auto z-[1002]">
            <style>{`
                @keyframes pulseOpacityA { 0%,100% { opacity: 0.9; } 50% { opacity: 0.6; } }
                @keyframes pulseOpacityB { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
            `}</style>
            {/* Full-screen camera */}
            {showFullScreen && (
                <div className="absolute inset-0 bg-black">
                    <video
                        ref={el => {
                            videoRef.current = el;
                            if (el && streamRef.current && !el.srcObject) el.srcObject = streamRef.current;
                        }}
                        autoPlay playsInline muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                </div>
            )}

            {/* PIP camera */}
            {showPip && (
                <div className="absolute top-3 left-3 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/40 z-1001 pointer-events-none">
                    <video
                        ref={el => {
                            videoRef.current = el;
                            if (el && streamRef.current && !el.srcObject) el.srcObject = streamRef.current;
                        }}
                        autoPlay playsInline muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                </div>
            )}

            {/* Setup loader */}
            {phase === 'setup' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <Loader size={32} className="text-white animate-spin mb-3" />
                    <p className="text-white font-medium" style={{ fontSize: 'calc(4 * var(--pw))' }}>Setting up camera...</p>
                </div>
            )}

            {/* Face check — BOTTOM */}
            {phase === 'face-check' && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
                        <p className="text-[#003d6b] font-bold mb-3 text-center" style={{ fontSize: 'calc(4 * var(--pw))' }}>Face Quality Check</p>
                        <CheckItem passed={checks.faceDetected} checking={true} label="Face detected" />
                        <CheckItem passed={checks.wellLit} checking={checks.faceDetected} label="Face well-lit" />
                        <CheckItem passed={checks.centered} checking={checks.wellLit} label="Face centered in frame" />
                        <CheckItem passed={checks.matchScore} checking={checks.centered} label="Face match verified" />
                        {allFaceChecksPassed && (
                            <button onClick={handleContinue} className="mt-3 w-full bg-[#003d6b] text-white font-semibold py-2.5 rounded-lg hover:bg-[#002d52] transition-colors cursor-pointer" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Liveness — BOTTOM (gray "Waiting..." until 104s, then green pulsing) */}
            {showLivenessCard && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
                        <p className="text-[#003d6b] font-bold mb-2 text-center" style={{ fontSize: 'calc(4 * var(--pw))' }}>Liveness Check</p>
                        {!livenessActive && (
                            <p className="text-gray-400 mb-3 text-center" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>Please wait...</p>
                        )}
                        {livenessActive && (
                            <p className="text-gray-600 mb-3 text-center" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>Blink twice and slowly turn your head left, then right.</p>
                        )}
                        <CheckItem passed={livenessChecks.blinked} checking={livenessActive} label="Blink detected (2x)" />
                        <CheckItem passed={livenessChecks.headTurned} checking={livenessActive} label="Head turn detected" />
                    </div>
                </div>
            )}

            {/* Audio — waiting phase with cycling messages */}
            {showAudioCard && !audioActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mx-4 w-[85%] max-w-xs shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <p className="text-[#003d6b] font-bold mb-3 text-center" style={{ fontSize: 'calc(4 * var(--pw))' }}>Audio Check</p>
                        <div className="flex items-center justify-center gap-2">
                            <Loader size={16} className="text-[#003d6b] animate-spin" />
                            <p className="text-gray-500 text-center" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                {WAITING_MESSAGES[waitingMsgIndex]}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Audio — full screen recording/review/verify */}
            {audioActive && !audioPass && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 px-6 py-8 pointer-events-auto z-[1002]">
                    {/* Top: instruction */}
                    <div className="w-full">
                        <p className="text-lack mb-4 text-md" >
                            Record below text in your voice
                        </p>
                        <p className="text-black leading-snug text-xl">
                            "{EXPECTED_TEXT}"
                        </p>
                    </div>

                    {/* Middle: mic / transcript / status */}
                    <div className="flex flex-col items-center gap-2 w-full">
                        {audioState === 'recording' && (
                            <>
                                <Mic size={30} className="text-[#003d6b] animate-[pulseOpacityA_1.2s_ease-in-out_infinite]" />
                                <p className="text-gray-500 text-sm animate-[pulseOpacityB_1.2s_ease-in-out_infinite]">Recording...</p>
                            </>
                        )}
                        {audioState === 'transcribing' && (
                            <>
                                <Loader size={36} className="text-[#003d6b] animate-spin" />
                                <p className="text-gray-500 text-sm" >Transcribing...</p>
                            </>
                        )}
                        {audioState === 'verifying' && (
                            <>
                                <Loader size={36} className="text-[#003d6b] animate-spin" />
                                <p className="text-gray-500 text-sm" >Verifying...</p>
                            </>
                        )}
                        {audioState === 'review' && transcript && (
                            <div ref={transcriptBoxRef} className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full overflow-y-auto" style={{ maxHeight: 'calc(25 * var(--pw))' }}>
                                <p className="text-blue-800 text-center" style={{ fontSize: 'calc(3.2 * var(--pw))' }}>
                                    {transcript}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom: error + buttons */}
                    <div className="w-full">
                        {audioError && (
                            <p className="text-red-500 text-center mb-2" style={{ fontSize: 'calc(3 * var(--pw))' }}>{audioError}</p>
                        )}

                        {audioState === 'recording' && (
                            <>
                                <p className="text-gray-600 text-center mb-2 text-sm">
                                    Please Tap <strong>DONE</strong> after <strong>speaking</strong>
                                </p>
                                <button
                                    onClick={handleAudioDone}
                                    className="w-full bg-[#003d6b] text-white font-bold py-2 rounded-lg hover:bg-[#002d52] transition-colors cursor-pointer uppercase tracking-wide"
                                    style={{ fontSize: 'calc(3.5 * var(--pw))' }}
                                >
                                    Done
                                </button>
                            </>
                        )}

                        {audioState === 'review' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAudioRetry}
                                    className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                                    style={{ fontSize: 'calc(3.5 * var(--pw))' }}
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={handleAudioContinue}
                                    className="flex-1 bg-[#003d6b] text-white font-semibold py-2 rounded-lg hover:bg-[#002d52] transition-colors cursor-pointer"
                                    style={{ fontSize: 'calc(3.5 * var(--pw))' }}
                                >
                                    Continue
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Audio verified */}
            {audioPass && showAudioCard && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mx-4 w-[85%] max-w-xs shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle size={18} className="text-green-500" />
                            <span className="text-green-700 font-medium" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>Audio verified</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Recording — CENTERED */}
            {showStartRecCard && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 mx-4 w-[85%] max-w-xs shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <p className="text-[#003d6b] font-bold mb-2 text-center" style={{ fontSize: 'calc(4 * var(--pw))' }}>Ready to Record</p>
                        <p className="text-gray-500 mb-4 text-center" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                            By clicking Start Recording, you confirm you are ready to begin this IRDAI-mandated session.
                        </p>
                        <button onClick={handleStartRecording} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                            <span className="w-3 h-3 bg-white rounded-full" />
                            Start Recording
                        </button>
                    </div>
                </div>
            )}

            {/* Recording indicator */}
            {phase === 'done' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-[1001]">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white font-semibold" style={{ fontSize: 'calc(3 * var(--pw))' }}>REC</span>
                </div>
            )}
        </div>
    );
}
