import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;
let offscreenCanvas = null;
let offscreenCtx = null;

export async function initFaceMesh() {
    if (faceLandmarker) return faceLandmarker;

    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
    });

    return faceLandmarker;
}

export function detectFace(videoElement, timestamp) {
    if (!faceLandmarker) return null;

    try {
        const result = faceLandmarker.detectForVideo(videoElement, timestamp);
        if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
            return { detected: false, landmarks: null, blendshapes: null };
        }

        const landmarks = result.faceLandmarks[0];
        const blendshapes = result.faceBlendshapes?.[0]?.categories || [];

        return { detected: true, landmarks, blendshapes };
    } catch (e) {
        return { detected: false, landmarks: null, blendshapes: null };
    }
}

// Check if nose landmark is near center of frame
export function isFaceCentered(landmarks, frameWidth, frameHeight) {
    if (!landmarks) return false;
    // Nose tip is landmark 1
    const nose = landmarks[1];
    const nx = nose.x; // normalized 0-1
    const ny = nose.y;
    // Accept if nose is within 30% of center
    return nx > 0.2 && nx < 0.8 && ny > 0.2 && ny < 0.8;
}

// Check brightness from video frame
export function checkBrightness(videoElement) {
    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCtx = offscreenCanvas.getContext('2d');
    }

    const w = 64; // sample at low res for speed
    const h = 48;
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
    offscreenCtx.drawImage(videoElement, 0, 0, w, h);

    const imageData = offscreenCtx.getImageData(0, 0, w, h);
    const data = imageData.data;
    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
        // Perceived brightness formula
        totalBrightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }

    const avgBrightness = totalBrightness / pixelCount;
    // Threshold: above 60 is considered well-lit (out of 255)
    return avgBrightness > 60;
}

// Blink detection using blendshapes
export function detectBlink(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return false;

    const leftBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft');
    const rightBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkRight');

    if (!leftBlink || !rightBlink) return false;

    // Both eyes closed if score > 0.3
    return leftBlink.score > 0.3 && rightBlink.score > 0.3;
}

// Head turn detection using nose position relative to face
export function getHeadTurnRatio(landmarks) {
    if (!landmarks) return 0.5;

    // Use nose tip (1) relative to left cheek (234) and right cheek (454)
    const nose = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    if (faceWidth < 0.01) return 0.5;

    // Ratio: 0 = turned far left, 1 = turned far right, 0.5 = center
    return (nose.x - leftCheek.x) / faceWidth;
}

export function cleanup() {
    if (faceLandmarker) {
        faceLandmarker.close();
        faceLandmarker = null;
    }
    offscreenCanvas = null;
    offscreenCtx = null;
}
