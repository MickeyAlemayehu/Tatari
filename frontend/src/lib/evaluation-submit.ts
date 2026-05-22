import { averageRating } from "./evaluation-helpers";

export interface EvaluationAnswer {
  questionId: number;
  rating?: number;
  text?: string;
}

export function buildEvaluationPayload(answers: EvaluationAnswer[]) {
  const ratings = answers.filter((a) => a.rating).map((a) => ({ rating: a.rating }));
  const textParts = answers.filter((a) => a.text?.trim()).map((a) => a.text!.trim());
  const score = averageRating(answers.map((a) => a.rating ?? 0));

  return {
    score: score || undefined,
    answers: ratings,
    comments: textParts.length ? textParts.join("\n\n") : undefined,
  };
}
