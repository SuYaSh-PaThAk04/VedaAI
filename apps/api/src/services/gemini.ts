import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AssignmentInput, GeneratedPaper } from "@vedaai/shared";
import { env } from "../config/env.js";
import { generateMockPaper } from "./mock-generator.js";
import { generatedPaperSchema } from "./paper.schema.js";
import { buildGenerationPrompt } from "./prompt.js";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("Gemini did not return a JSON object.");
}

export async function generatePaper(input: AssignmentInput): Promise<GeneratedPaper> {
  if (env.MOCK_AI || !env.GEMINI_API_KEY) {
    console.warn(
      "[gemini] Using mock paper generator. Set GEMINI_API_KEY and MOCK_AI=false in apps/api/.env for real AI questions."
    );
    return generateMockPaper(input);
  }

  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4
    }
  });

  const response = await model.generateContent(buildGenerationPrompt(input));
  const raw = response.response.text();
  const parsed = JSON.parse(extractJson(raw));

  return generatedPaperSchema.parse(parsed);
}
