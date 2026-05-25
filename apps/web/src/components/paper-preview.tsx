import type { GeneratedPaper, PaperQuestion } from "@vedaai/shared";

function difficultyLabel(difficulty: PaperQuestion["difficulty"]) {
  if (difficulty === "medium") {
    return "Moderate";
  }

  if (difficulty === "hard") {
    return "Challenging";
  }

  return "Easy";
}

function QuestionItem({ question, index }: { question: PaperQuestion; index: number }) {
  return (
    <li className="grid gap-2">
      <p>
        {index + 1}. [{difficultyLabel(question.difficulty)}] {question.text} [{question.marks} Marks]
      </p>
      {question.options?.length ? (
        <ul className="ml-6 grid gap-1">
          {question.options.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PaperPreview({ paper }: { paper: GeneratedPaper }) {
  const answerKey = paper.sections.flatMap((section) => section.questions).filter((question) => question.answer);

  return (
    <article className="question-paper-print mx-auto min-h-0 w-full max-w-[820px] rounded-t-[18px] bg-white px-4 py-6 text-[#222] shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:px-7 sm:py-8 md:min-h-[900px] md:px-12">
      <header className="text-center">
        <h1 className="text-lg font-extrabold sm:text-2xl">Delhi Public School, Sector-4, Bokaro</h1>
        <p className="mt-1 text-sm font-extrabold sm:text-lg">Subject: {paper.subject}</p>
        <p className="text-sm font-extrabold sm:text-lg">Class: {paper.grade}</p>
        <p className="mt-1 text-xs font-extrabold sm:text-base">{paper.title}</p>
      </header>

      <div className="mt-6 flex flex-col gap-1 text-xs font-bold sm:mt-8 sm:flex-row sm:justify-between sm:text-sm">
        <span>Time Allowed: {paper.duration}</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      <p className="mt-4 text-xs font-bold sm:mt-5 sm:text-sm">All questions are compulsory unless stated otherwise.</p>

      <div className="mt-4 grid w-full max-w-xs gap-1 text-xs font-bold sm:mt-5 sm:text-sm">
        <div className="flex gap-2">
          <span>Name:</span>
          <span className="mt-4 h-px flex-1 bg-[#333]" />
        </div>
        <div className="flex gap-2">
          <span>Roll Number:</span>
          <span className="mt-4 h-px flex-1 bg-[#333]" />
        </div>
        <div className="flex gap-2">
          <span>Section:</span>
          <span className="mt-4 h-px flex-1 bg-[#333]" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8">
        {paper.sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-center text-lg font-extrabold">{section.title}</h2>
            <div className="mt-7">
              <h3 className="text-sm font-extrabold">
                {section.questions[0]?.type === "multiple-choice"
                  ? "Multiple Choice Questions"
                  : section.questions[0]?.type === "short-answer"
                    ? "Short Answer Questions"
                    : section.questions[0]?.type === "true-false"
                      ? "True / False Questions"
                      : "Questions"}
              </h3>
              <p className="text-xs italic">{section.instruction}</p>
            </div>

            <ol className="mt-4 grid gap-3 text-[12px] leading-5 sm:mt-5 sm:gap-4 sm:text-[13px] sm:leading-6">
              {section.questions.map((question, index) => (
                <QuestionItem key={question.id} question={question} index={index} />
              ))}
            </ol>

          </section>
        ))}
      </div>

      <p className="mt-6 text-xs font-extrabold sm:mt-8 sm:text-sm">End Of Question Paper</p>

      {answerKey.length ? (
        <section className="mt-8 border-t border-[#ddd] pt-6 sm:mt-10 sm:pt-8">
          <h2 className="text-lg font-extrabold">Answer Key</h2>
          <ol className="mt-4 grid gap-3 text-[13px] leading-6">
            {answerKey.map((question, index) => (
              <li key={question.id}>
                <span className="font-extrabold">{index + 1}.</span> {question.answer}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}
