import type { AssignmentInput, Difficulty, GeneratedPaper, PaperQuestion, QuestionType } from "@vedaai/shared";

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

const historyMcq = [
  {
    text: "Who was the first Mughal emperor of India?",
    options: ["a) Akbar", "b) Babur", "c) Humayun", "d) Aurangzeb"],
    answer: "b) Babur"
  },
  {
    text: "In which year did India gain independence?",
    options: ["a) 1945", "b) 1946", "c) 1947", "d) 1950"],
    answer: "c) 1947"
  },
  {
    text: "The Indus Valley Civilization was primarily located in present-day:",
    options: ["a) Egypt", "b) Pakistan and northwest India", "c) China", "d) Mesopotamia"],
    answer: "b) Pakistan and northwest India"
  },
  {
    text: "Who led the Dandi March in 1930?",
    options: ["a) Jawaharlal Nehru", "b) Subhas Chandra Bose", "c) Mahatma Gandhi", "d) Bhagat Singh"],
    answer: "c) Mahatma Gandhi"
  },
  {
    text: "The Battle of Plassey was fought in:",
    options: ["a) 1757", "b) 1857", "c) 1764", "d) 1772"],
    answer: "a) 1757"
  },
  {
    text: "The Mauryan Empire's capital at its peak was:",
    options: ["a) Pataliputra", "b) Delhi", "c) Ujjain", "d) Taxila"],
    answer: "a) Pataliputra"
  },
  {
    text: "Who wrote the book 'Discovery of India'?",
    options: ["a) Rabindranath Tagore", "b) Jawaharlal Nehru", "c) Maulana Azad", "d) Sardar Patel"],
    answer: "b) Jawaharlal Nehru"
  },
  {
    text: "The Quit India Movement was launched in:",
    options: ["a) 1920", "b) 1930", "c) 1942", "d) 1945"],
    answer: "c) 1942"
  },
  {
    text: "Ashoka spread Buddhism after the battle of:",
    options: ["a) Panipat", "b) Kalinga", "c) Tarain", "d) Plassey"],
    answer: "b) Kalinga"
  },
  {
    text: "The French East India Company's main trading centre in India was:",
    options: ["a) Madras", "b) Bombay", "c) Pondicherry", "d) Calcutta"],
    answer: "c) Pondicherry"
  }
];

function buildQuestion(
  type: QuestionType,
  subject: string,
  grade: string,
  index: number,
  marks: number,
  id: string
): PaperQuestion {
  const difficulty = difficulties[index % difficulties.length];

  if (type === "multiple-choice") {
    const bank = historyMcq[index % historyMcq.length];
    return {
      id,
      text: bank.text,
      type,
      difficulty,
      marks,
      options: bank.options,
      answer: bank.answer
    };
  }

  if (type === "true-false") {
    const statement = `${subject} was an important topic in ${grade} curriculum. (True/False)`;
    return {
      id,
      text: statement,
      type,
      difficulty,
      marks,
      options: ["a) True", "b) False"],
      answer: index % 2 === 0 ? "a) True" : "b) False"
    };
  }

  if (type === "long-answer") {
    return {
      id,
      text: `Explain the significance of a major event in ${subject} with reference to ${grade} syllabus topics.`,
      type,
      difficulty,
      marks,
      answer: `A detailed explanation covering causes, key figures, outcomes, and historical importance in ${subject}.`
    };
  }

  return {
    id,
    text: `Define a key term or concept from ${subject} relevant to ${grade} students.`,
    type,
    difficulty,
    marks,
    answer: `A concise definition with one supporting example from ${subject}.`
  };
}

export function generateMockPaper(input: AssignmentInput): GeneratedPaper {
  let questionNumber = 1;

  const sections = input.questionConfigs.map((config, index) => {
    const sectionLetter = String.fromCharCode(65 + index);
    const questions: PaperQuestion[] = Array.from({ length: config.count }, (_, questionIndex) =>
      buildQuestion(
        config.type,
        input.subject,
        input.grade,
        questionIndex + index,
        config.marks,
        `q${questionNumber++}`
      )
    );

    return {
      id: `section-${sectionLetter.toLowerCase()}`,
      title: `Section ${sectionLetter}`,
      instruction: "Attempt all questions.",
      questions
    };
  });

  const totalMarks = sections.reduce(
    (total, section) => total + section.questions.reduce((sum, question) => sum + question.marks, 0),
    0
  );

  return {
    title: input.title,
    subject: input.subject,
    grade: input.grade,
    totalMarks,
    duration: totalMarks > 50 ? "3 hours" : "2 hours",
    sections
  };
}
