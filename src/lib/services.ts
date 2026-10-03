/**
 * Répertoire des services municipaux de Terra Nova (demande D05).
 *
 * Contenu éditorial fixe : les habitants doivent pouvoir identifier le bon
 * service et le contacter facilement. Chaque service porte un `slug` stable
 * utilisé par le formulaire de contact.
 */

export type CityService = {
  slug: string;
  name: string;
  category: string;
  description: string;
  email: string;
};

export const cityServiceCategories = [
  'Administration',
  'Cadre de vie',
  'Services techniques',
  'Social & citoyenneté',
] as const;

export const cityServices: CityService[] = [
  {
    slug: 'etat-civil',
    name: 'État civil',
    category: 'Administration',
    description:
      'Naissances, mariages, papiers d’identité et documents officiels.',
    email: 'etat-civil@terranova.city',
  },
  {
    slug: 'relations-citoyennes',
    name: 'Relations citoyennes',
    category: 'Administration',
    description:
      'Questions, réclamations et accompagnement dans tes démarches.',
    email: 'relations@terranova.city',
  },
  {
    slug: 'urbanisme',
    name: 'Urbanisme & logement',
    category: 'Cadre de vie',
    description:
      'Permis de construire, autorisations et questions de logement.',
    email: 'urbanisme@terranova.city',
  },
  {
    slug: 'proprete-dechets',
    name: 'Propreté & déchets',
    category: 'Cadre de vie',
    description:
      'Collecte des ordures, encombrants, tri et propreté des espaces publics.',
    email: 'proprete@terranova.city',
  },
  {
    slug: 'eau-assainissement',
    name: 'Eau & assainissement',
    category: 'Services techniques',
    description: 'Compteurs, fuites, qualité de l’eau et facturation.',
    email: 'eau@terranova.city',
  },
  {
    slug: 'voirie-mobilite',
    name: 'Voirie & mobilité',
    category: 'Services techniques',
    description: 'Chaussées, éclairage public, signalisation et transports.',
    email: 'voirie@terranova.city',
  },
  {
    slug: 'action-sociale',
    name: 'Action sociale',
    category: 'Social & citoyenneté',
    description:
      'Aides, accompagnement des familles et solidarité entre habitants.',
    email: 'social@terranova.city',
  },
  {
    slug: 'vie-associative',
    name: 'Vie associative & culture',
    category: 'Social & citoyenneté',
    description:
      'Associations, événements municipaux et vie culturelle de la ville.',
    email: 'culture@terranova.city',
  },
];

export function getCityService(slug: string): CityService | null {
  return cityServices.find((service) => service.slug === slug) ?? null;
}
