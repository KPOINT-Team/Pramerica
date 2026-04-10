import { GoogleGenAI } from '@google/genai';

export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function createGeminiClient() {
    return new GoogleGenAI({ apiKey: API_KEY });
}

const CHAT_MODEL = 'gemini-2.0-flash';

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function transcribeAudio(blob, mimeType = 'audio/webm') {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const base64 = await blobToBase64(blob);
    const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: [{
            parts: [
                { inlineData: { mimeType, data: base64 } },
                { text: 'Transcribe this audio into English text only. Return ONLY the spoken words, nothing else. No labels, no quotes, no prefixes.' }
            ]
        }]
    });
    return (response.text || '').trim();
}

export async function verifySpeechText(spokenText, expectedText) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: `Compare these two texts and respond with ONLY "pass" or "fail". Pass if the spoken text is similar in meaning to the expected text (minor word differences, paraphrasing, or small errors are OK). Fail only if it's completely different or nonsensical.

Expected: "${expectedText}"
Spoken: "${spokenText}"

Response (pass or fail only):`,
    });
    const result = (response.text || '').trim().toLowerCase();
    return result.includes('pass');
}
