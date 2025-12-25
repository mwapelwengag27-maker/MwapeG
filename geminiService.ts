import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  const apiKey = process.env.API_KEY || "";
  // Re-instantiate if key becomes available or if instance hasn't been created
  if (!aiInstance && apiKey) {
    aiInstance = new GoogleGenAI({ apiKey });
  } else if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be limited.");
    return null;
  }
  return aiInstance;
};

export const getTeamSummary = async (data: any) => {
  const ai = getAI();
  if (!ai) return "AI insights currently unavailable (Missing API Key).";

  const prompt = `Based on the following Praise Team data, provide a 3-sentence executive summary of the current health and activities of the team.
  Data: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert organizational consultant for church praise teams."
      }
    });
    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights currently unavailable.";
  }
};

export const suggestSetlist = async (theme: string, songLibrary: string[]) => {
  const ai = getAI();
  if (!ai) return "AI suggestions currently unavailable.";

  const prompt = `The theme for Sunday service is "${theme}". Based on our song library: ${songLibrary.join(', ')}, suggest a setlist of 4 songs (2 praise, 2 worship) with brief justifications.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "No suggestions found.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI suggestions currently unavailable.";
  }
};