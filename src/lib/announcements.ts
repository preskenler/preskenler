/**
 * Annonces publiques de la Ville de Terra Nova (demande D06).
 *
 * Contenu éditorial fixe pour l’instant : la ville publie des informations
 * pratiques que les habitants consultent depuis le portail.
 */

export type Announcement = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  publishedAt: string;
};

export const announcements: Announcement[] = [
  {
    slug: 'ouverture-portail-numerique',
    title: 'Le portail numérique de Terra Nova ouvre ses services',
    category: 'Vie municipale',
    excerpt:
      'Créer ton compte, retrouver les services de la ville et joindre l’administration : tout est désormais au même endroit.',
    body: [
      'Le portail numérique de la Ville de Terra Nova est ouvert. Les habitants peuvent créer leur compte, se connecter à leur espace personnel et accéder aux principaux services municipaux.',
      'De nouveaux services seront ajoutés progressivement : suivi des demandes, annonces de la ville et démarches en ligne.',
      'Pour toute question, le service des Relations citoyennes reste joignable depuis le formulaire de contact du portail.',
    ].join('\n\n'),
    publishedAt: '2026-10-01',
  },
  {
    slug: 'collecte-encombrants',
    title: 'Collecte des encombrants : nouveau passage mensuel',
    category: 'Cadre de vie',
    excerpt:
      'La collecte des encombrants a désormais lieu le premier samedi de chaque mois dans tous les quartiers.',
    body: [
      'Afin de simplifier la vie des habitants, la collecte des encombrants se tiendra désormais le premier samedi de chaque mois.',
      'Les objets doivent être déposés la veille au soir devant le domicile, en respectant les consignes de tri.',
      'Les déchets dangereux (peintures, produits chimiques) ne sont pas acceptés et doivent être déposés en déchèterie.',
    ].join('\n\n'),
    publishedAt: '2026-09-28',
  },
  {
    slug: 'travaux-avenue-des-fondateurs',
    title: 'Travaux de voirie avenue des Fondateurs',
    category: 'Voirie',
    excerpt:
      'Des travaux de réfection de la chaussée sont prévus avenue des Fondateurs pendant trois semaines.',
    body: [
      'La Ville procède à la réfection de la chaussée de l’avenue des Fondateurs. Les travaux dureront environ trois semaines.',
      'Une circulation alternée sera mise en place aux heures de pointe. Les lignes de transport adaptent leur itinéraire.',
      'La Ville remercie les habitants pour leur compréhension et fait son possible pour limiter la gêne.',
    ].join('\n\n'),
    publishedAt: '2026-09-25',
  },
  {
    slug: 'permanences-etat-civil',
    title: 'Permanences d’état civil le samedi matin',
    category: 'Administration',
    excerpt:
      'Le service d’état civil ouvre désormais ses permanences le samedi matin sur rendez-vous.',
    body: [
      'Pour mieux accompagner les habitants, le service d’état civil propose désormais des permanences le samedi matin.',
      'Les rendez-vous se prennent depuis l’espace personnel ou par le formulaire de contact du portail.',
      'Les démarches urgentes restent traitées en priorité en semaine.',
    ].join('\n\n'),
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

export function formatAnnouncementDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(new Date(value));
}
