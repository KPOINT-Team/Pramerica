import { GoogleGenAI } from '@google/genai';
import { proxyGenerate } from './authService.js';

export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const CHAT_MODEL = 'gemini-2.0-flash';

export function createGeminiClientWithToken(ephemeralToken) {
    // Ephemeral tokens require v1alpha — v1beta returns 404
    return new GoogleGenAI({
        apiKey: ephemeralToken,
        httpOptions: { apiVersion: 'v1alpha' },
    });
}

function extractText(response) {
    // Serialized Gemini response loses the .text getter — extract manually
    try {
        return response.candidates[0].content.parts[0].text || '';
    } catch {
        return '';
    }
}

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
    const base64 = await blobToBase64(blob);
    const response = await proxyGenerate({
        model: CHAT_MODEL,
        contents: [{
            parts: [
                { inlineData: { mimeType, data: base64 } },
                { text: 'Transcribe this audio into English text only, even if the speaker is speaking Hindi or any other language — transliterate or translate into English. Return ONLY the spoken words in English, nothing else. No labels, no quotes, no prefixes.' }
            ]
        }]
    });
    return extractText(response).trim();
}

export async function verifySpeechText(spokenText, expectedText) {
    const response = await proxyGenerate({
        model: CHAT_MODEL,
        contents: [{
            parts: [{
                text: `Compare these two texts and respond with ONLY "pass" or "fail". Pass if the spoken text is similar in meaning to the expected text (minor word differences, paraphrasing, or small errors are OK). Fail only if it's completely different or nonsensical.

Expected: "${expectedText}"
Spoken: "${spokenText}"

Response (pass or fail only):`
            }]
        }]
    });
    const result = extractText(response).trim().toLowerCase();
    return result.includes('pass');
}
