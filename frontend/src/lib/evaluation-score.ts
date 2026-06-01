/**
 * Client-side preview of the backend EvaluationScoreService.
 *
 * IMPORTANT: this is preview / fallback only. The backend remains the
 * source of truth for stored scores — submission re-computes on the
 * server and persists that snapshot. Use this for instant UI feedback
 * while the user is filling out the form.
 *
 * Rules mirror EvaluationScoreService::calculate():
 *   1. rating wins if numeric
 *   2. otherwise multi/single-select uses avg(value of selected options)
 *   3. otherwise the question contributes nothing
 *   weighted = raw * question.weight
 *   final    = sum(weighted) / sum(weights of scored questions)
 *   rounded  to 2 decimal places
 */

export interface PreviewAnswer {
  question_id: number;
  rating?: number | null;
  selected_options?: number[] | null;
}

export interface PreviewQuestion {
  id: number;
  weight?: number | null;
  options?: Array<{ id: number; value: number }>;
}

function rawScore(answer: PreviewAnswer, question: PreviewQuestion): number | null {
  if (typeof answer.rating === "number" && Number.isFinite(answer.rating)) {
    return answer.rating;
  }

  const selected = answer.selected_options;
  if (Array.isArray(selected) && selected.length > 0 && question.options?.length) {
    const values = question.options
      .filter((o) => selected.includes(o.id))
      .map((o) => Number(o.value));
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  return null;
}

export function calculatePreviewScore(
  answers: PreviewAnswer[],
  questions: PreviewQuestion[]
): number | null {
  const questionsById = new Map(questions.map((q) => [q.id, q]));
  let weightedSum = 0;
  let weightTotal = 0;

  for (const ans of answers) {
    const q = questionsById.get(ans.question_id);
    if (!q) continue;

    const weight = Number(q.weight ?? 1);
    if (!Number.isFinite(weight) || weight <= 0) continue;

    const raw = rawScore(ans, q);
    if (raw === null) continue;

    weightedSum += raw * weight;
    weightTotal += weight;
  }

  if (weightTotal <= 0) return null;
  return Math.round((weightedSum / weightTotal) * 100) / 100;
}
