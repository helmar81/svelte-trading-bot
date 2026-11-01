import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const debateBitcoin = onRequest(
  { secrets: [geminiApiKey] },
  async (req, res) => {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: req.body.prompt || "Analyze current Bitcoin market setup.",
      });

      res.json({ text: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);