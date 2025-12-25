
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the API key from environment variables.
// MUST use named parameter { apiKey: process.env.API_KEY }.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTeamSummary = async (data: any) => {
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
    // Use response.text property directly, do not call it as a function.
    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights currently unavailable.";
  }
};

export const suggestSetlist = async (theme: string, songLibrary: string[]) => {
  const prompt = `The theme for Sunday service is "${theme}". Based on our song library: ${songLibrary.join(', ')}, suggest a setlist of 4 songs (2 praise, 2 worship) with brief justifications.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    // Use response.text property directly.
    return response.text || "No suggestions found.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI suggestions currently unavailable.";
  }
};
