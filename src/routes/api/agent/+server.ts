import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    // Uses GEMINI_API_KEY from process.env or .env file securely on the server
    const apiKey = process.env.GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents:
        prompt || 'Analyze current Bitcoin market setup with bullish and bearish perspectives.'
    });

    return json({ success: true, text: response.text });
  } catch (error: unknown) {
    console.error('Agent API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to run agent analysis';
    return json({ success: false, error: message }, { status: 500 });
  }
};
