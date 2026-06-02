/**
 * Builds the canonical evaluation-submit payload. Answers now use the
 * backend's canonical shape: `{ question_id, rating?, selected_options?,
 * text_answer? }`. The backend re-computes the score via
 * EvaluationScoreService, so the client no longer sends `score` — that
 * keeps the backend the source of truth and avoids stale client-side
 * weighting if the template was edited mid-session.
 */

export interface EvaluationAnswerInput {
  questionId: number;
  rating?: number | null;
  text?: string | null;
  selectedOptions?: number[] | null;
}

export interface SubmittedAnswer {
  question_id: number;
  rating?: number;
  text_answer?: string;
  selected_options?: number[];
}

export function buildEvaluationPayload(answers: EvaluationAnswerInput[]) {
  const submitted: SubmittedAnswer[] = answers
    .filter(
      (a) =>
        (typeof a.rating === "number" && Number.isFinite(a.rating)) ||
        (a.text && a.text.trim().length > 0) ||
        (Array.isArray(a.selectedOptions) && a.selectedOptions.length > 0)
    )
    .map((a) => {
      const entry: SubmittedAnswer = { question_id: a.questionId };
      if (typeof a.rating === "number" && Number.isFinite(a.rating)) {
        entry.rating = a.rating;
      }
      if (a.text && a.text.trim().length > 0) {
        entry.text_answer = a.text.trim();
      }
      if (Array.isArray(a.selectedOptions) && a.selectedOptions.length > 0) {
        entry.selected_options = a.selectedOptions;
      }
      return entry;
    });

  const textParts = answers
    .filter((a) => a.text?.trim())
    .map((a) => a.text!.trim());

  return {
    answers: submitted,
    comments: textParts.length ? textParts.join("\n\n") : undefined,
  };
}
