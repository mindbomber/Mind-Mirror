
import { GoogleGenAI, Type } from "@google/genai";
import { Question, ArchetypeResult, UserAnswer } from "../types";

export class GeminiService {
  static async generateRoundQuestions(roundNumber: number, theme: string, previousAnswers: UserAnswer[]): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the ongoing story narrative for the AI
    const storySoFar = previousAnswers.length > 0 
      ? previousAnswers.map(a => `Action: ${a.selectedOptionText}`).join('\n')
      : "The protagonist has just begun their journey.";

    const prompt = `You are a Master Narrative Designer for a mystical, choice-driven odyssey called 'Mind Mirror'.
    Current Phase: ${theme} (Round ${roundNumber} of 5).
    
    The Story So Far:
    ${storySoFar}
    
    TASK: Generate 3 consecutive narrative choices (questions) for this chapter. 
    The choices should feel like an unfolding story. 
    Each question should include a 'narrativeContext' (1-2 sentences) that describes the scene before presenting the options.
    Options should represent different psychological temperaments (Risk-taking, Empathy, Logic, Chaos, etc.).
    
    Output only valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "The choice the user must make (e.g. 'What do you do?')"},
              narrativeContext: { type: Type.STRING, description: "The story text setting the scene for this choice." },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    weight: { type: Type.STRING }
                  },
                  required: ["id", "text", "weight"]
                }
              }
            },
            required: ["id", "text", "narrativeContext", "options"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse narrative questions", e);
      throw e;
    }
  }

  static async analyzeArchetype(allAnswers: UserAnswer[]): Promise<ArchetypeResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const journeySummary = allAnswers.map(a => `Chapter ${a.round}: ${a.questionText} -> Choice: ${a.selectedOptionText}`).join('\n');

    const prompt = `You are a Psychological Story Weaver. A traveler has completed an odyssey. 
    Based on the path they carved, reveal their true Inner Archetype.
    
    The Traveler's Journey:
    ${journeySummary}
    
    TASK: Return a JSON object with:
    1. title: A legendary 2-3 word archetype name (e.g., 'The Relentless Seeker', 'The Weaver of Dreams').
    2. description: A profound summary (3-4 sentences) that frames their choices as evidence of their core spirit. Speak directly to them.
    3. traits: 5-6 symbolic attributes forged during the journey.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            traits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "traits"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  }
}
