/**
 * Annonces publiques de la Ville de Terra Nova (demande D06).
 *
 * Métadonnées éditoriales fixes. Le texte affiché (titre, résumé, corps) vit
 * dans `messages/*.json` (namespace `Public.Announcements`), ce qui permet de
 * le traduire par locale.
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
