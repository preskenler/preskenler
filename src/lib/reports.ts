/**
 * Citizen problem reports — a broken street lamp, a pothole, uncollected
 * waste… (demande F25). Kept DB-free so the public form can import the
 * category list and the status labels without pulling in Prisma.
 */

export const problemCategories = [
  'streetlight',
  'road',
  'waste',
  'water',
  'green-space',
  'other',
] as const;

export type ProblemCategory = (typeof problemCategories)[number];

export const problemCategoryServices: Record<ProblemCategory, string> = {
  streetlight: 'voirie-mobilite',
  road: 'voirie-mobilite',
  waste: 'proprete-dechets',
  water: 'eau-assainissement',
  'green-space': 'cadre-de-vie',
  other: 'relations-citoyennes',
};

export const problemStatuses = ['new', 'in_progress', 'resolved'] as const;

export type ProblemStatus = (typeof problemStatuses)[number];

export function isProblemCategory(value: unknown): value is ProblemCategory {
  return (
    typeof value === 'string' &&
    (problemCategories as readonly string[]).includes(value)
  );
}

export function isProblemStatus(value: unknown): value is ProblemStatus {
  return (
    typeof value === 'string' &&
    (problemStatuses as readonly string[]).includes(value)
  );
}

export function serviceForCategory(category: ProblemCategory): string {
  return problemCategoryServices[category];
}

export type ProblemReportView = {
  id: string;
  reference: string;
  service: string;
  category: ProblemCategory;
  location: string;
  description: string;
  status: ProblemStatus;
  createdAt: string;
};
