import { json } from "@sveltejs/kit";
import { GoogleGenAI } from "@google/genai";
const POST = async ({ request }) => {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt || "Analyze current Bitcoin market setup with bullish and bearish perspectives."
    });
    return json({ success: true, text: response.text });
  } catch (error) {
    console.error("Agent API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to run agent analysis";
    return json({ success: false, error: message }, { status: 500 });
  }
};
export {
  POST
};
