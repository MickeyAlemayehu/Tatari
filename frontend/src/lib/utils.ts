const BALANCE_COLORS = [
  "from-[#06B6D4] to-[#06B6D4]",
  "from-[#EF4444] to-[#EF4444]",
  "from-[#4F46E5] to-[#4338CA]",
  "from-[#F59E0B] to-[#F59E0B]",
  "from-[#22C55E] to-[#22C55E]",
];

export function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function permissionLabel(level: number): string {
  if (level >= 10) return "Admin";
  if (level >= 6) return "Manager";
  if (level >= 4) return "HR";
  return "Employee";
}

export function balanceColor(index: number): string {
  return BALANCE_COLORS[index % BALANCE_COLORS.length] ?? "from-[#4F46E5] to-[#4338CA]";
}

export function textToList(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "";
  if (parts.length === 1) {
    return { first_name: first, last_name: first };
  }
  return {
    first_name: first,
    last_name: parts.slice(1).join(" "),
  };
}
