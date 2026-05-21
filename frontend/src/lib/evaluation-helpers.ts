import type { EvaluationAssignmentRecord } from "../services/performance.service";

export function averageRating(ratings: number[]): number {
  const valid = ratings.filter((r) => r > 0);
  if (!valid.length) return 0;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

export function findAssignment(
  assignments: EvaluationAssignmentRecord[],
  id?: string,
  type?: string
): EvaluationAssignmentRecord | undefined {
  if (id) {
    return assignments.find((a) => String(a.id) === id);
  }
  if (type) {
    return assignments.find(
      (a) => a.type === type && a.status !== "submitted" && a.status !== "completed"
    );
  }
  return undefined;
}
