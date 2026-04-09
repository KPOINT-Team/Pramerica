import { GoogleGenAI } from '@google/genai';

export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function createGeminiClient() {
    return new GoogleGenAI({ apiKey: API_KEY });
}

const CHAT_MODEL = 'gemini-2.0-flash';

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
