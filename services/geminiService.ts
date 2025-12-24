
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing Gemini with required named parameter and direct process.env.API_KEY access as per guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateGreeting(userInput: string) {
    try {
      // Calling generateContent directly with model and prompt as required by SDK guidelines
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userInput,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.8,
          // Removed maxOutputTokens to follow guidelines recommending avoidance unless paired with thinkingBudget
        },
      });
      // response.text is a direct property of GenerateContentResponse
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "The festive spirits are momentarily quiet. May your holidays be golden and bright regardless.";
    }
  }
}

export const gemini = new GeminiService();
