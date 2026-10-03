/**
 * Répertoire des services municipaux de Terra Nova (demande D05).
 *
 * Contenu éditorial fixe : les habitants doivent pouvoir identifier le bon
 * service et le contacter facilement. Chaque service porte un `slug` stable
 * utilisé par le formulaire de contact.
 *
 * Les libellés affichés au public vivent désormais dans `messages/*.json`
 * (namespace `Public.Services`). Les champs `name`/`description` ci-dessous
 * restent en français pour les espaces agent/citoyen, qui ne sont pas encore
 * traduits.
 */

export const cityServiceCategories = [
  'administration',
  'cadre-de-vie',
  'services-techniques',
  'social-citoyennete',
] as const;

export type CityServiceCategory = (typeof cityServiceCategories)[number];

export type CityService = {
  slug: string;
  name: string;
  category: CityServiceCategory;
  description: string;
  email: string;
};

export const cityServices: CityService[] = [
  {
    slug: 'etat-civil',
    name: 'État civil',
    category: 'administration',
    description:
      'Naissances, mariages, papiers d’identité et documents officiels.',
    email: 'etat-civil@terranova.city',
  },
  {
    slug: 'relations-citoyennes',
    name: 'Relations citoyennes',
    category: 'administration',
    description:
      'Questions, réclamations et accompagnement dans tes démarches.',
    email: 'relations@terranova.city',
  },
  {
    slug: 'urbanisme',
    name: 'Urbanisme & logement',
    category: 'cadre-de-vie',
    description:
      'Permis de construire, autorisations et questions de logement.',
    email: 'urbanisme@terranova.city',
  },
  {
    slug: 'proprete-dechets',
    name: 'Propreté & déchets',
    category: 'cadre-de-vie',
    description:
      'Collecte des ordures, encombrants, tri et propreté des espaces publics.',
    email: 'proprete@terranova.city',
  },
  {
    slug: 'eau-assainissement',
    name: 'Eau & assainissement',
    category: 'services-techniques',
    description: 'Compteurs, fuites, qualité de l’eau et facturation.',
    email: 'eau@terranova.city',
  },
  {
    slug: 'voirie-mobilite',
    name: 'Voirie & mobilité',
    category: 'services-techniques',
    description: 'Chaussées, éclairage public, signalisation et transports.',
    email: 'voirie@terranova.city',
  },
  {
    slug: 'action-sociale',
    name: 'Action sociale',
    category: 'social-citoyennete',
    description:
      'Aides, accompagnement des familles et solidarité entre habitants.',
    email: 'social@terranova.city',
  },
  {
    slug: 'vie-associative',
    name: 'Vie associative & culture',
    category: 'social-citoyennete',
    description:
      'Associations, événements municipaux et vie culturelle de la ville.',
    email: 'culture@terranova.city',
  },
];

export function getCityService(slug: string): CityService | null {
  return cityServices.find((service) => service.slug === slug) ?? null;
}
