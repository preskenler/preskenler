/**
 * Public announcements for the City of Terra Nova (demande D06).
 *
 * Fixed editorial metadata. The displayed text (title, excerpt, body) lives in
 * `messages/*.json` (namespace `Public.Announcements`) so it can be translated
 * per locale.
 */

export const announcementCategories = [
  'vie-municipale',
  'cadre-de-vie',
  'voirie',
  'administration',
] as const;

export type AnnouncementCategory = (typeof announcementCategories)[number];

export type Announcement = {
  slug: string;
  category: AnnouncementCategory;
  publishedAt: string;
};

export const announcements: Announcement[] = [
  {
    slug: 'ouverture-portail-numerique',
    category: 'vie-municipale',
    publishedAt: '2026-10-01',
  },
  {
    slug: 'collecte-encombrants',
    category: 'cadre-de-vie',
    publishedAt: '2026-09-28',
  },
  {
    slug: 'travaux-avenue-des-fondateurs',
    category: 'voirie',
    publishedAt: '2026-09-25',
  },
  {
    slug: 'permanences-etat-civil',
    category: 'administration',
    publishedAt: '2026-09-20',
  },
];

export function getAnnouncement(slug: string): Announcement | null {
  return (
    announcements.find((announcement) => announcement.slug === slug) ?? null
  );
}

export function getLatestAnnouncements(limit: number): Announcement[] {
  return [...announcements]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}
