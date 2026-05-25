import type { AssignmentInput } from "@vedaai/shared";

const typeLabel: Record<string, string> = {
  "multiple-choice": "Multiple choice (4 options: a, b, c, d)",
  "short-answer": "Short answer",
  "long-answer": "Long answer / descriptive",
  "true-false": "True or false"
};

export function buildGenerationPrompt(input: AssignmentInput) {
  const blueprint = input.questionConfigs
    .map((config) => `- ${typeLabel[config.type]}: ${config.count} questions, ${config.marks} marks each`)
    .join("\n");

  const sourceText = input.sourceText?.trim()
    ? `Use this source material as the primary context:\n${input.sourceText.slice(0, 12000)}`
    : "No source file was supplied. Generate curriculum-appropriate questions from the assignment metadata.";

  return `
You are an expert assessment designer. Create a complete exam paper as STRICT JSON only.

Assignment:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade: ${input.grade}
- Due date: ${input.dueDate}
- Additional instructions: ${input.instructions || "None"}

Question blueprint:
${blueprint}

${sourceText}

Rules:
- Return valid JSON only. No markdown fences or commentary.
- Write REAL exam questions for ${input.subject} at ${input.grade} level. Never use placeholders like "question 1" or "choose the correct option: subject question N".
- Group questions into sections (Section A, Section B, etc.) matching the blueprint order.
- Each section needs a clear instruction (e.g. "Attempt all questions.").
- difficulty must be: easy, medium, or hard.
- totalMarks must equal the sum of all question marks.

Question-type rules:
- multiple-choice: "text" is the question stem only. Provide "options" as exactly 4 strings prefixed with "a) ", "b) ", "c) ", "d) ". Provide "answer" with the correct option letter and text (e.g. "b) Mughal Empire").
- true-false: provide "options": ["a) True", "b) False"] and "answer" (e.g. "a) True").
- short-answer / long-answer: no options. Provide "answer" with a concise model answer for the answer key.
- Do not put options inside "text"; keep options in the options array.

JSON shape:
{
  "title": "string",
  "subject": "string",
  "grade": "string",
  "totalMarks": 100,
  "duration": "2 hours",
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions.",
      "questions": [
        {
          "id": "q1",
          "text": "Who was the first Mughal emperor of India?",
          "type": "multiple-choice",
          "difficulty": "easy",
          "marks": 2,
          "options": ["a) Akbar", "b) Babur", "c) Humayun", "d) Aurangzeb"],
          "answer": "b) Babur"
        }
      ]
    }
  ]
}
`.trim();
}
