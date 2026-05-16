export interface Pathway {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  markPath: string;
  href?: string;
}

const PATHWAYS_BASE_URL = 'https://resiliencefrontiers.org/pathways/';

export const pathways: Pathway[] = [
  {
    id: 'humanity-with-nature',
    number: 'P/01',
    title: 'Transforming humanity’s relationship with nature',
    subtitle: 'A symbiotic oneness',
    description:
      'Engaging in everyday activities that have a net positive effect on nature — using frontier technologies and indigenous knowledge to enrich, rather than deplete, our environment.',
    color: '#97B73B',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M10,50 Q30,20 50,40 Q70,60 90,30 M50,40 L40,65 M50,40 L60,65 M40,65 L35,80 M40,65 L45,80 M60,65 L55,80 M60,65 L65,80',
  },
  {
    id: 'lifelong-learning',
    number: 'P/02',
    title: 'Lifelong learning for environmental stewardship',
    subtitle: 'Guardians of nature',
    description:
      'Education that embraces collective responsibility — with indigenous leaders, art, film, community events and digital platforms complementing a journey of stewardship.',
    color: '#5B8FB9',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M10,50 L25,50 L25,35 L40,35 L40,65 L55,65 L55,30 L70,30 L70,70 Q80,50 90,50',
  },
  {
    id: 'data-frontier-tech',
    number: 'P/03',
    title: 'Universal access to data & frontier technologies',
    subtitle: 'Stewardship of the global commons',
    description:
      'Big data, AI, digital twinning and Earth observation — governed ethically in the collective interests of people and planet to safeguard the global commons.',
    color: '#333184',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M15,70 Q25,30 50,20 Q75,10 85,50 M85,50 Q75,70 50,60 Q25,50 15,70',
  },
  {
    id: 'water-resources',
    number: 'P/04',
    title: 'Equitable management of water & natural resources',
    subtitle: 'Participatory stewardship',
    description:
      'Equitable access to the water, air and land that sustain our lives. Participatory management backed by fair access to geospatial, AI and big data technologies.',
    color: '#5B8FB9',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M50,10 L50,90 M50,50 L20,25 M50,50 L80,25 M50,50 L20,75 M50,50 L80,75 M50,50 L10,50 M50,50 L90,50',
  },
  {
    id: 'transboundary',
    number: 'P/05',
    title: 'Equitable management of transboundary concerns',
    subtitle: 'Cooperation, not competition',
    description:
      'Collective conservation, restoration and regeneration of ecosystems spanning political borders — protected through equitable use of frontier technologies and binding agreements.',
    color: '#0A1628',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M50,50 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M50,50 L20,25 M50,50 L80,25 M50,50 L20,75 M50,50 L80,75',
  },
  {
    id: 'health-wellbeing',
    number: 'P/06',
    title: 'Holistic, ecosystem-centred health and well-being',
    subtitle: 'Human-natural systems thriving together',
    description:
      'Neighbourhoods that merge with the natural world — circular materials, biophilic design, a one-health approach, and real-time data systems for human and ecological health.',
    color: '#97B73B',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M10,50 Q20,30 30,50 Q40,70 50,50 Q60,30 70,50 Q80,70 90,50',
  },
  {
    id: 'regenerative-food',
    number: 'P/07',
    title: 'Regenerative food production',
    subtitle: 'Food that works with nature',
    description:
      'Permaculture principles, water retention, nutrient renewal, biodiversity restoration and frontier technologies — producing nutritious food accessible and affordable to all.',
    color: '#4A7C59',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M50,80 L50,30 M50,30 Q35,15 20,20 M50,30 Q65,15 80,20 M50,50 Q40,40 30,45 M50,50 Q60,40 70,45',
  },
  {
    id: 'rebuilt-finance',
    number: 'P/08',
    title: 'A rebuilt financial & economic system',
    subtitle: 'Capital for shared prosperity',
    description:
      'Innovative financial mechanisms that channel funding to organizations committed to a sustainable, resilient world — linking wealth directly to the welfare of people and planet.',
    color: '#D97757',
    href: PATHWAYS_BASE_URL,
    markPath:
      'M15,30 L85,30 M15,50 L85,50 M15,70 L85,70 M15,30 L15,70 M45,30 L45,70',
  },
];
