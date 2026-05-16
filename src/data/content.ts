export interface Insight {
  id: string;
  category: string;
  date: string;
  dateFormatted: string;
  title: string;
  excerpt: string;
  readTime: string;
  edition: string;
  pathway?: string;
  href: string;
}

export interface Event {
  id: string;
  type: string;
  date: string;
  year: string;
  title: string;
  location: string;
  description: string;
  href?: string;
  featured?: boolean;
}

export interface NewsItem {
  id: string;
  category: string;
  day: string;
  month: string;
  year: string;
  title: string;
  href: string;
  image: string;
  lead?: boolean;
}

const RF = 'https://resiliencefrontiers.org';
const RF_IMG = (path: string) => `${RF}/wp-content/uploads/${path}`;

export const insights: Insight[] = [
  {
    id: 'leap-02-becoming-indigenous',
    category: 'Essay',
    date: '2025-11-01',
    dateFormatted: 'Nov 2025',
    title: 'Becoming Indigenous: A Return to the Roots is the Way Forward',
    excerpt:
      'Indigenous worldviews as living infrastructure for the resilient futures we say we want — anchoring stewardship, reciprocity and care in everyday systems.',
    readTime: '11 min read',
    edition: 'LEAP / Edition 02',
    pathway: 'P/01',
    href: `${RF}/leap/`,
  },
  {
    id: 'leap-02-nature-positive-economy',
    category: 'Provocation',
    date: '2025-11-01',
    dateFormatted: 'Nov 2025',
    title: 'Nature-Positive Economy: The Idea Whose Time Has Come',
    excerpt:
      'Why the next era of economic policy must reckon with regenerative value — and what foresight reveals about getting there before the window closes.',
    readTime: '9 min read',
    edition: 'LEAP / Edition 02',
    pathway: 'P/08',
    href: `${RF}/leap/`,
  },
  {
    id: 'leap-02-river-dreamed-in-code',
    category: 'Feature',
    date: '2025-11-01',
    dateFormatted: 'Nov 2025',
    title: 'The River That Dreamed in Code',
    excerpt:
      'A speculative essay on watershed AI, ecological agency and the legal personhood of waterways — written from inside the storyline of Pathway P/04.',
    readTime: '14 min read',
    edition: 'LEAP / Edition 02',
    pathway: 'P/04',
    href: `${RF}/leap/`,
  },
];

export const events: Event[] = [
  {
    id: 'cop28-pavilion',
    type: 'Pavilion / Programme',
    date: '30 Nov – 12 Dec',
    year: '2023',
    title: 'COP 28 Pavilion and events, Dubai',
    location: 'Dubai, UAE',
    description:
      'A large-format convening that anchored the events archive and set the tone for the full programme — pavilion sessions, dialogues and creative interventions.',
    featured: true,
    href: `${RF}/events/`,
  },
  {
    id: 'songdo-working-session',
    type: 'Workshop',
    date: 'Aug 28, 2023',
    year: '2023',
    title: 'Working Session, Songdo',
    location: 'Songdo, Republic of Korea',
    description:
      'Resilience Frontiers reconvened a group of over 100 leading thinkers to revisit and sharpen the eight pathways.',
    href: `${RF}/events/`,
  },
  {
    id: 'cop27-pavilion',
    type: 'Pavilion',
    date: 'Nov 7, 2022',
    year: '2022',
    title: 'COP 27 Pavilion, Sharm El Sheikh',
    location: 'Sharm El Sheikh, Egypt',
    description:
      'A packed programme of creative sessions and dialogues at the Resilience Frontiers pavilion — convening foresight, art and policy.',
    href: `${RF}/events/`,
  },
  {
    id: 'gaborone-brainstorm',
    type: 'Brainstorming meeting',
    date: 'Aug 22, 2022',
    year: '2022',
    title: 'Second brainstorming meeting, Gaborone',
    location: 'Gaborone, Botswana',
    description:
      'Held at the Botswana Global Adaptation Week — sharpening pathway storylines through African foresight perspectives.',
    href: `${RF}/events/`,
  },
  {
    id: 'bonn-stakeholder',
    type: 'Reception',
    date: 'Jun 8, 2022',
    year: '2022',
    title: 'Stakeholder engagement reception, Bonn',
    location: 'Bonn, Germany',
    description:
      'A reception in Bonn to share reflections on transforming systems and to deepen relationships with the SB partners and observers.',
    href: `${RF}/events/`,
  },
  {
    id: 'cop26-pavilion',
    type: 'Pavilion',
    date: 'Nov 1, 2021',
    year: '2021',
    title: 'COP 26 Pavilion, Glasgow',
    location: 'Glasgow, UK',
    description:
      'Resilience Frontiers hosted the Resilience Lab at COP 26, November 1–11 — eleven days of convenings and live programming.',
    href: `${RF}/events/`,
  },
  {
    id: 'cop25-pavilion',
    type: 'Pavilion',
    date: 'Dec 2, 2019',
    year: '2019',
    title: 'COP 25 Pavilion, Madrid',
    location: 'Madrid, Spain',
    description:
      'The first Resilience Frontiers Pavilion — a focal point for futures-thinking approaches at the climate negotiations.',
    href: `${RF}/events/`,
  },
];

export const news: NewsItem[] = [
  {
    id: 'perry-world-house-festival',
    category: 'News',
    day: '16',
    month: 'Oct',
    year: '2025',
    title:
      'Resilience Frontiers & Perry World House announce winner of inaugural film festival',
    href: `${RF}/news/resilience-frontiers-perry-world-house-announce-winner-of-inaugural-film-festival/`,
    image: RF_IMG('2025/10/Screenshot-2025-10-16-at-18.30.38-1024x829.png'),
    lead: true,
  },
  {
    id: 'slycan-climate-fiction',
    category: 'News',
    day: '26',
    month: 'Aug',
    year: '2025',
    title:
      'Resilience Frontiers and Slycan Trust launch Climate Fiction contest',
    href: `${RF}/uncategorized/resilience-frontiers-and-slycan-trust-launch-climate-fiction-contest/`,
    image: RF_IMG('2025/08/etienne-girardet-EP6_VZhzXM8-unsplash-1024x768.jpg'),
  },
  {
    id: 'sundance-film-festival',
    category: 'News',
    day: '27',
    month: 'Jan',
    year: '2025',
    title: 'Resilience Frontiers launches new film festival at Sundance',
    href: `${RF}/uncategorized/resilience-frontiers-launches-new-film-festival-at-sundance/`,
    image: RF_IMG('2025/01/jon-tyson-A-obUh61bKw-unsplash-1024x683.jpg'),
  },
  {
    id: 'cop28-mon-11-dec',
    category: 'News',
    day: '11',
    month: 'Dec',
    year: '2023',
    title: 'Highlights from COP 28 (Mon 11 Dec)',
    href: `${RF}/uncategorized/highlights-from-cop-28-mon-11-dec/`,
    image: RF_IMG('2023/12/RF-Day-8-37-1024x684.jpg'),
  },
  {
    id: 'cop28-creative-notes',
    category: 'News',
    day: '09',
    month: 'Dec',
    year: '2023',
    title: 'Creative notes at COP 28',
    href: `${RF}/uncategorized/creative-notes-at-cop-28/`,
    image: RF_IMG('2023/12/IMG_8084.heic'),
  },
  {
    id: 'cop28-fri-8-dec',
    category: 'News',
    day: '09',
    month: 'Dec',
    year: '2023',
    title: 'Highlights from COP 28 (Fri 8 Dec)',
    href: `${RF}/uncategorized/highlights-from-cop-28-fri-8-dec/`,
    image: RF_IMG('2023/12/RF-Day-6-14-1024x684.jpg'),
  },
  {
    id: 'cop28-wed-6-dec',
    category: 'News',
    day: '08',
    month: 'Dec',
    year: '2023',
    title: 'Highlights from COP 28 (Wed 6 Dec)',
    href: `${RF}/uncategorized/highlights-from-cop-28-wed-6-dec/`,
    image: RF_IMG('2023/12/RF-Day-5-21-1024x684.jpg'),
  },
  {
    id: 'cop28-conversations',
    category: 'News',
    day: '06',
    month: 'Dec',
    year: '2023',
    title: 'Conversations across generations',
    href: `${RF}/uncategorized/conversations-across-generations/`,
    image: RF_IMG('2023/12/RF-Day-5-25-1024x684.jpg'),
  },
];

export const partners = [
  'UNFCCC Adaptation Programme',
  'UN Environment Programme',
  'UN-Habitat',
  'UNICEF',
  'WHO',
  'IPCC',
  'Future Earth',
  'Stockholm Resilience Centre',
  'World Resources Institute',
  'IIASA',
  'IRENA',
  'Slycan Trust',
];
