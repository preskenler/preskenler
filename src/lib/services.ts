/**
 * Terra Nova municipal services directory (demande D05).
 *
 * Fixed editorial metadata: residents need to identify the right service and
 * contact it easily. Each service carries a stable `slug`, used by the contact
 * form and as the key into the `Public.Services.items` messages, where the
 * localized `name`/`description` live. Contact details stay non-localized.
 */

export const cityServiceCategories = [
  'sante',
  'administration',
  'cadre-de-vie',
  'services-techniques',
  'social-citoyennete',
] as const;

export type CityServiceCategory = (typeof cityServiceCategories)[number];

export type CityService = {
  slug: string;
  category: CityServiceCategory;
  email: string;
};

export const cityServices: CityService[] = [
  {
    slug: 'sante',
    category: 'sante',
    email: 'sante@terranova.city',
  },
  {
    slug: 'prevention-sante',
    category: 'sante',
    email: 'prevention@terranova.city',
  },
  {
    slug: 'etat-civil',
    category: 'administration',
    email: 'etat-civil@terranova.city',
  },
  {
    slug: 'relations-citoyennes',
    category: 'administration',
    email: 'relations@terranova.city',
  },
  {
    slug: 'urbanisme',
    category: 'cadre-de-vie',
    email: 'urbanisme@terranova.city',
  },
  {
    slug: 'proprete-dechets',
    category: 'cadre-de-vie',
    email: 'proprete@terranova.city',
  },
  {
    slug: 'eau-assainissement',
    category: 'services-techniques',
    email: 'eau@terranova.city',
  },
  {
    slug: 'voirie-mobilite',
    category: 'services-techniques',
    email: 'voirie@terranova.city',
  },
  {
    slug: 'action-sociale',
    category: 'social-citoyennete',
    email: 'social@terranova.city',
  },
  {
    slug: 'vie-associative',
    category: 'social-citoyennete',
    email: 'culture@terranova.city',
  },
];
