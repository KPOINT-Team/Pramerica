let audioContext = null;
let analyser = null;
let dataArray = null;

export async function initAudioAnalyser(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

export function getVolume() {
    if (!analyser || !dataArray) return 0;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    return sum / dataArray.length;
}

// Returns true if volume is above speech threshold
export function isVoiceDetected() {
    return getVolume() > 25;
}

export function cleanup() {
    if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
    }
    analyser = null;
    dataArray = null;
}
