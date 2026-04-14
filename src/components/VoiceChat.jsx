import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { createGeminiClientWithToken, LIVE_MODEL } from '../services/geminiService.js';
import { getLiveToken } from '../services/authService.js';
import { pausePlayer, playPlayer, isPlayerPaused } from './VideoPlayer.jsx';

function encode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const SYSTEM_INSTRUCTION = `You are Aditi, a friendly and professional Pramerica Life Insurance policy guide assisting customers during a video KYC session. You speak clearly, concisely, and warmly. Respond in the same language the customer speaks (English or Hindi).

Here is your knowledge base — answer ONLY from this context. If a question falls outside this scope, politely say you can help with policy-related queries and suggest calling the helpline at 1800-102-7070.

POLICY INFORMATION:
- Free look period: 30 days from the date the customer receives the policy. They can cancel and get a full refund minus any medical or stamp duty charges.
- Missed premium: There is a 30-day grace period to pay. If paid within that window the policy stays fully active. If it lapses, it can be revived by paying outstanding premiums.
- Nominee update: The customer can update their nominee anytime by submitting a nomination change request form online at pramericalife.in or at the nearest branch.
- Claim documents: The nominee will need the original policy document, a filled claim form, identity proof, and the death certificate for a death claim. The team will guide them step by step.
- Increasing cover: Depending on the policy type, options may be available to increase cover at specific milestones. The customer should call the helpline or speak to their advisor for plan-specific options.
- Session recording: The recording is mandated by IRDAI (Insurance Regulatory and Development Authority of India). It exists to protect the customer and ensure they were properly informed. It can be used in their favour if any disputes arise later.
- Policy cancellation: The customer can cancel within the 30-day free look period and receive a full refund minus applicable charges. After 30 days, different terms apply — they should call the helpline for guidance.

RULES:
1. Keep answers short (2-4 sentences max).
2. Be warm and reassuring — this is a customer onboarding call.
3. Never fabricate policy details not present in the context above.
4. If unsure, direct the customer to the helpline: 1800-102-7070.`;

export default function VoiceChat() {
    const [status, setStatus] = useState('idle'); // idle | connecting | listening | speaking
    const statusRef = useRef('idle');
    const sessionRef = useRef(null);
    const isSessionActiveRef = useRef(false);
    const isCleaningUpRef = useRef(false);
    const audioContextsRef = useRef({});
    const audioNodesRef = useRef({});
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set());
    const mediaStreamRef = useRef(null);
    const wasPlayerPausedRef = useRef(false);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const cleanupSession = useCallback(() => {
        if (isCleaningUpRef.current) return;
        isCleaningUpRef.current = true;

        isSessionActiveRef.current = false;

        if (audioNodesRef.current.workletNode) {
            audioNodesRef.current.workletNode.port.onmessage = null;
            audioNodesRef.current.workletNode.disconnect();
        }
        if (audioNodesRef.current.source) {
            audioNodesRef.current.source.disconnect();
        }
        audioNodesRef.current = {};

        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch (e) {}
            sessionRef.current = null;
        }

        audioSourcesRef.current.forEach(s => {
            try { s.stop(); } catch (e) {}
        });
        audioSourcesRef.current.clear();

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextsRef.current.input) {
            audioContextsRef.current.input.close().catch(() => {});
        }
        if (audioContextsRef.current.output) {
            audioContextsRef.current.output.close().catch(() => {});
        }

        audioContextsRef.current = {};
        setStatus('idle');
        nextStartTimeRef.current = 0;
    }, []);

    const startSession = useCallback(async () => {
        if (isSessionActiveRef.current) return;

        isCleaningUpRef.current = false;
        setStatus('connecting');

        // Bake all constraints into the ephemeral token
        const liveConfig = {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingBudget: 0 },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        };
        const { token: ephemeralToken } = await getLiveToken(LIVE_MODEL, liveConfig);
        const ai = createGeminiClientWithToken(ephemeralToken);

        try {
            const inputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            if (inputCtx.state === 'suspended') await inputCtx.resume();
            if (outputCtx.state === 'suspended') await outputCtx.resume();

            audioContextsRef.current = { input: inputCtx, output: outputCtx };

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // No config — all constraints baked into the ephemeral token
            const sessionPromise = ai.live.connect({
                model: LIVE_MODEL,
                callbacks: {
                    onopen: async () => {
                        isSessionActiveRef.current = true;
                        setStatus('listening');

                        await inputCtx.audioWorklet.addModule('/audio-processor.js');
                        const source = inputCtx.createMediaStreamSource(stream);
                        const workletNode = new AudioWorkletNode(inputCtx, 'pcm-processor');
                        audioNodesRef.current = { source, workletNode };

                        workletNode.port.onmessage = (e) => {
                            if (!isSessionActiveRef.current) return;
                            if (statusRef.current !== 'listening') return;

                            const int16Buffer = e.data;
                            sessionPromise.then(session => {
                                if (isSessionActiveRef.current) {
                                    try {
                                        session.sendRealtimeInput({
                                            media: {
                                                data: encode(new Uint8Array(int16Buffer)),
                                                mimeType: 'audio/pcm;rate=16000',
                                            },
                                        });
                                    } catch (err) {
                                        console.warn('Failed to send audio:', err);
                                        cleanupSession();
                                    }
                                }
                            }).catch(() => {});
                        };

                        source.connect(workletNode);
                        workletNode.connect(inputCtx.destination);
                    },
                    onmessage: async (message) => {
                        if (!isSessionActiveRef.current) return;

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioContextsRef.current.output) {
                            setStatus('speaking');
                            try {
                                // Ensure AudioContext is running (mobile can suspend it)
                                if (audioContextsRef.current.output.state === 'suspended') {
                                    await audioContextsRef.current.output.resume();
                                }
                                const audioData = decode(base64Audio);
                                const dataInt16 = new Int16Array(audioData.buffer, audioData.byteOffset, audioData.byteLength / 2);
                                const frameCount = dataInt16.length;
                                const buffer = audioContextsRef.current.output.createBuffer(1, frameCount, 24000);
                                const channelData = buffer.getChannelData(0);
                                for (let i = 0; i < frameCount; i++) {
                                    channelData[i] = dataInt16[i] / 32768.0;
                                }

                                const source = audioContextsRef.current.output.createBufferSource();
                                source.buffer = buffer;
                                source.connect(audioContextsRef.current.output.destination);

                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextsRef.current.output.currentTime);
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;

                                audioSourcesRef.current.add(source);
                                source.onended = () => {
                                    audioSourcesRef.current.delete(source);
                                    if (audioSourcesRef.current.size === 0 && isSessionActiveRef.current) {
                                        setStatus('listening');
                                    }
                                };
                            } catch (e) {
                                console.error('Audio playback error:', e);
                            }
                        }

                        if (message.serverContent?.turnComplete) {
                            setStatus('listening');
                        }

                        if (message.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setStatus('listening');
                        }
                    },
                    onerror: (e) => {
                        console.error('Live Session Error:', e?.message || e);
                        cleanupSession();
                    },
                    onclose: () => {
                        cleanupSession();
                    },
                },
            });

            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error('Failed to start Live Session:', err);
            setStatus('idle');
        }
    }, [cleanupSession]);

    const handleMicClick = () => {
        if (status === 'idle') {
            wasPlayerPausedRef.current = isPlayerPaused();
            pausePlayer();
            startSession();
        } else {
            cleanupSession();
            if (!wasPlayerPausedRef.current) {
                playPlayer();
            }
        }
    };

    return (
        <>
            <style>{`
                @keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.8); opacity: 0; } }
                @keyframes glow { 0%,100% { box-shadow: 0 4px 24px rgba(239,68,68,0.4); } 50% { box-shadow: 0 4px 32px rgba(239,68,68,0.65), 0 0 0 6px rgba(239,68,68,0.1); } }
                @keyframes dotPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                @keyframes micPulse { 0%,100% { box-shadow: 0 2px 12px rgba(0,0,0,0.1), 0 0 0 0 rgba(0,148,202,0.15); } 50% { box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 8px rgba(0,148,202,0.08); } }
            `}</style>
            <div className="absolute bottom-5 left-6 z-[1003] flex flex-col items-start gap-2 pointer-events-auto">
                {status !== 'idle' && (
                    <span className="bg-black/75 backdrop-blur-xl p-2 text-white font-semibold px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]" style={{ fontSize: 'calc(3 * var(--pw))' }}>
                        <span
                            className={`w-2 h-2 rounded-full shrink-0  ${status === 'listening' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ animation: 'dotPulse 1s ease-in-out infinite' }}
                        />
                        {status === 'connecting' ? 'Connecting...' : status === 'listening' ? 'Listening...' : 'Aditi is speaking...'}
                    </span>
                )}

                <div className="relative flex items-center justify-center">
                    {status === 'listening' && (
                        <>
                            <span className="absolute w-12 h-12 rounded-full border-2 border-red-500/40 pointer-events-none" style={{ animation: 'ripple 2s ease-out infinite' }} />
                            <span className="absolute w-12 h-12 rounded-full border-2 border-red-500/40 pointer-events-none" style={{ animation: 'ripple 2s ease-out infinite 0.7s' }} />
                            <span className="absolute w-12 h-12 rounded-full border-2 border-red-500/40 pointer-events-none" style={{ animation: 'ripple 2s ease-out infinite 1.4s' }} />
                        </>
                    )}

                    <button
                        onClick={handleMicClick}
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                            status !== 'idle'
                                ? 'bg-red-500 text-white border-2 border-red-400/50 shadow-[0_4px_24px_rgba(239,68,68,0.45)]'
                                : 'bg-white text-[#0066b3] border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                        }`}
                        style={
                            status === 'speaking'
                                ? { animation: 'glow 1.2s ease-in-out infinite' }
                                : status === 'idle'
                                ? { animation: 'micPulse 2.5s ease-in-out infinite' }
                                : undefined
                        }
                    >
                        {status === 'connecting' && <Loader size={20} className="animate-spin" />}
                        {status === 'idle' && <Mic size={20} />}
                        {(status === 'listening' || status === 'speaking') && <Square size={14} fill="currentColor" />}
                    </button>
                </div>
            </div>
        </>
    );
}
