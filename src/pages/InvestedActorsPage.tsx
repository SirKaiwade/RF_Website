import { Link } from 'react-router-dom';
import PageHero from '../components/page/PageHero';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ActorGroup {
  heading: string;
  body?: string;
  partners: string[];
}

const groups: ActorGroup[] = [
  {
    heading: 'Action pledge partners',
    body: 'Partners of the Resilience Frontiers action pledge.',
    partners: [
      'Bangladesh Centre for Advanced Studies',
      'Food and Agriculture Organization of the United Nations (FAO)',
      'Global Water Partnership (GWP)',
      'Green Climate Fund (GCF)',
      'International Centre for Climate Change and Development',
      'Development Research Centre',
      'International Federation of Red Cross and Red Crescent Societies',
      'Ramsar Convention Secretariat',
      'Secretariat of the Convention on Biological Diversity (CBD)',
      'Sri Lankan Youth Climate Action Network Trust (SLYCAN)',
      'United Nations Convention to Combat Desertification (UNCCD)',
      'United Nations Environment Programme (UNEP)',
      'United Nations Office for Outer Space Affairs (UNOOSA)',
    ],
  },
  {
    heading: 'UN agencies',
    partners: [
      'International Telecommunication Union (ITU)',
      'UN-Habitat',
      'United Nations Children’s Fund (UNICEF)',
      'United Nations Economic and Social Commission for Asia and the Pacific (UNESCAP)',
      'United Nations Foundation',
      'United Nations Institute for Training and Research (UNITAR)',
      'The United Nations Office for Disaster Risk Reduction (UNDRR)',
      'United Nations University',
      'World Health Organization (WHO)',
      'United Nations Educational, Scientific and Cultural Organization (UNESCO)',
      'United Nations Development Programme (UNDP)',
    ],
  },
  {
    heading: 'Academic institutions',
    partners: [
      'Australian National University',
      'Bath Spa University',
      'Bogazici University',
      'Cairo University',
      'California Institute of Technology',
      'Chonnam National University',
      'Cooper Union',
      'Grantham Institute',
      'Griffith University',
      'Hague University of Applied Sciences (THUAS)',
      'Hanze University of Applied Sciences',
      'Hawaii Institute for Human Rights',
      'Hertie School of Governance',
      'Illinois Institute of Technology',
      'Imperial College London',
      'Jahangirnagar University',
      'Jet Propulsion Laboratory (JPL)',
      'King Abdullah University of Science and Technology (KAUST)',
      'Kyunghee University',
      'London School of Economics and Political Science',
      'Massachusetts Institute of Technology (MIT)',
      'Ohio State University',
      'Oregon Health & Science University',
      'Palacky University Olomouc',
      'Rambhai Barni Rajabhat University',
      'Rhodes University',
      'Singularity University',
      'St. Andrews University',
      'Stockholm School of Economics',
      'Taraba State University Jalingo',
      'TechCamp',
      'Tecnologico de Monterrey',
      'The University of Oxford',
      'The University of Waikato',
      'Universidade de Sao Paulo',
      'Universidad CES',
      'University of Bonn',
      'University of Cologne',
      'University of British Columbia',
      'University of Copenhagen',
      'University of Dundee',
      'University of Ghana',
      'University of Greenwich – Natural Resources Institute',
      'University of Liberal Arts Bangladesh',
      'University of London',
      'University of Michigan',
      'University of Pennsylvania',
      'University of Sao Paulo',
      'St. George’s University',
      'University of Toronto',
      'University of Utah',
      'University of Vermont',
      'Victoria University of Wellington',
      'Vrije Universiteit Amsterdam',
      'Worcester Polytechnic Institute',
      'Yale University',
    ],
  },
  {
    heading: 'Research, think tanks and institutes',
    partners: [
      '4CF',
      'Adaptation Institute for Global Environmental Strategies',
      'Alan Turing Institute',
      'Asia Pacific Institute of Climate Change Mitigation and Adaptation Foundation Inc.',
      'Brazilian National Institute for Space Research (INPE)',
      'Capital Institute',
      'Center for Engaged Foresight',
      'Center for International Forestry Research (CIFOR)',
      'Center for Strategic Foresight',
      'Centre for Climate Research Singapore',
      'Consultative Group on International Agricultural Research (CGIAR)',
      'Emerging Future Institute',
      'Futur/io Institute',
      'Institute for Global Environmental Strategies (IGES)',
      'Institute for Sustainable Technologies — National Research Institute (ITeE-PIB)',
      'International Center for Climate Change and Development (ICCCAD)',
      'International Development Research Centre (IDRC)',
      'International Institute for Applied Systems Analysis (IIASA)',
      'International Institute for Sustainable Development (IISD)',
      'Munich Climate Insurance Initiative (MCII)',
      'National Centre for Space Studies Earth Observation Program, France',
      'National Centre for Space Studies (CNES)',
      'PIK-Potsdam',
      'PLanet',
      'South African Institute of International Affairs (SAIIA)',
      'Stockholm Environment Institute',
      'Stockholm International Water Institute (SIWI)',
      'Sustainable Development Policy Institute (SDPI)',
      'The Future Society',
      'The Resilience Institute',
      'The Reuters Institute',
      'World Resources Institute',
    ],
  },
  {
    heading: 'CSOs, NGOs, community organizations and networks',
    partners: [
      '‘Āina Momona',
      '50by40',
      'Alliance for a Green Revolution in Africa (AGRA)',
      'Alliance for Climate Change and Environmental Protection',
      'Alliance for Global Water Adaptation (AGWA)',
      'Alliance of Mother Nature’s Guardian',
      'ALOHAS Resilience Foundation',
      'Asia Indigenous Peoples Pact',
      'Association des Femmes Peules Autochtones du Tchad (AFPAT)',
      'B Labs',
      'Better World – Cameroon',
      'Birdlife International',
      'Business for Social Responsibility (BSR)',
      'Campaign for Female Education',
      'CANEUS International',
      'CECOEDECON',
      'CEHRDF',
      'Climate Policy Radar',
      'Conservation International',
      'Day of Adaptation',
      'Ellen MacArthur Foundation',
      'Emkan Futures',
      'FHI 360',
      'Forest Foundation Philippines',
      'Gain Forest',
      'Gender CC – Women for Climate Justice, Southern Africa',
      'Girls in Charge Initiative',
      'Global Call For Climate Action',
      'Global Crop Diversity Trust',
      'Global Network of Civil Society Organizations for Disaster Reduction',
      'Global Reporting Initiative (GRI)',
      'Global Resilience Partnership',
      'Green Africa Youth Organization',
      'Green Generation Initiative',
      'Groundwork London',
      'Group on Earth Observations (GEO)',
      'Hand in Hand India',
      'Hot Poets',
      'Humanitarian OpenStreetMap Team',
      'Humane Society International',
      'Indigenous Environmental Network',
      'Indigenous Friends Association',
      'Indigenous Peoples Rights International',
      'Innovative Finance Foundation',
      'IINAS',
      'IWGIA',
      'Local Governments for Sustainability (ICLEI)',
      'Midwest Energy Efficiency Alliance (MEEA)',
      'MKAI',
      'National Farmers Union Environment Forum',
      'One Earth',
      'One Resilient Earth',
      'Open Society Foundations',
      'Porous City Network',
      'ProVeg International',
      'Quadrature Climate Foundation',
      'Save the Children UK',
      'silkroad.earth',
      'Stratsearch Foundation Inc.',
      'SUFINDA',
      'Sustainable Development Policy Institute',
      'Sustainable Ocean Alliance',
      'Teratree',
      'The New Humanism Project',
      'The Pacific Islands Climate Network',
      'The Rockefeller Foundation',
      'The Rockies Institute (TRI)',
      'The Word Forest Organization',
      'Trobenbos International',
      'United Nations Youth Constituencies Ocean Group',
      'VSO Cambodia',
      'Winrock — PIER',
      'Wisdom Ways',
      'Women in Renewable Energy Association',
      'World Agroforestry (ICRAF)',
      'World Benchmarking Alliance',
      'World Business Council for Sustainable Development (WBCSD)',
      'World Humanitarian Forum',
      'World Wide Fund for Nature (WWF)',
      'Young Professionals for Agricultural Development',
      'Youth Climate Lab',
      'Youthinkgreen Egypt',
    ],
  },
  {
    heading: 'International, intergovernmental organizations and entities',
    partners: [
      'African Risk Capacity',
      'Crop Trust',
      'European Environment Agency',
      'Higher Regional Court of Cologne',
      'International Renewable Energy Agency (IRENA)',
      'International Union for Conservation of Nature (IUCN)',
      'National Inuit Youth Council',
      'Nepal Federation of Indigenous Nationalities',
      'Nordic Council of Ministers',
      'Public Health Dorset',
      'Ramsar Convention on Wetlands',
      'Snowchange Cooperative',
      'Te Ara Whatu',
    ],
  },
  {
    heading: 'National, regional and subnational',
    partners: [
      'European Commission',
      'Foresight Working Group, Hellenic Republic, Presidency of the Government of Greece',
      'German Embassy in Cairo',
      'Glasgow City Council',
      'Government of Nariño',
      'Ministry of Environment, Germany',
      'NASA',
    ],
  },
  {
    heading: 'Consulting services and impact businesses',
    partners: [
      '3 ideas B.V',
      'Agvesto',
      'Aleph Farms',
      'Algapelago Marine Ltd',
      'Arup',
      'Beverly Hills Productions',
      'Biocarbon Associates',
      'BlueLabs',
      'BlueNalu',
      'Brainscapital Srl',
      'CAOS – Borboletas e Sustentabilidade',
      'Climate & Energy Associates DLR Projektträger',
      'Clyde and Co. LLP',
      'Column',
      'Africa Knows',
      'Deloitte Consulting',
      'DHL',
      'Diligent Ventures',
      'DNV GL',
      'Earthbanc',
      'Enveda Biosciences',
      'Environmental Resources Management',
      'Exponential Minds',
      'fivemoreminutes',
      'Foodshed.io',
      'GcM Consulting Srl',
      'GenBlue',
      'Ghost Company',
      'Gojek',
      'Google',
      'Greater Than Equal',
      'ICATALIST',
      'IKEA of Sweden',
      'Interlinks Traceability Services',
      'IV.AI',
      'ICF',
      'J. Walter Thompson',
      'Leidos',
      'Living Future Institute',
      'LTS International',
      'Microsoft Corp.',
      'Mozilla Corporation',
      'Natural Capital Partners',
      'Natural Eco Capital',
      'Neutopia.co',
      'NowNext',
      'Onepoint5media / Innovators Magazine',
      'Qlik',
      'ReGen Villages Holding',
      'Replenish Earth',
      'Rhino Films',
      'Ronin Consulting Group',
      'SAHhoch3',
      'Samyak Developments',
      'theSlintec',
      'Space4Innovation',
      'Sterling Hawkins',
      'Singularity Media Inc',
      'Team Human',
      'Tech Won’t Save Us',
      'Terta Tech',
      'The People',
      'TreePlanet',
      'Valico Co. Ltd.',
      'Validity Labs AG',
      'Walt Disney Animation Studios',
      'WildStar',
      'Willis Towers Watson',
    ],
  },
  {
    heading: 'Financial services and institutions',
    partners: [
      'African Development Bank',
      'Asian Development Bank',
      'CAF — Banco de desarrollo de América Latina',
      'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)',
      'European Investment Bank',
      'FinRes',
      'Islamic Development Bank',
      'Sinovation Ventures',
      'World Bank',
    ],
  },
];

const supporters = ['Sabesp', '3M', 'Climate-KIC', 'BMW Foundation'];

export default function InvestedActorsPage() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.05 });

  return (
    <>
      <PageHero
        eyebrow="Invested actors"
        title={
          <>
            a global network
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              behind the work.
            </em>
          </>
        }
        lede="Resilience Frontiers’ commitment to transformative change has benefited from expert insight and input from a multifaceted range of thought leaders and organizations — from the late Mario Molina (1995 Nobel Prize in Chemistry) and Professor Rattan Lal (World Food Prize), to broadcaster Henry Bonsu, filmmaker Lesley Chilcott, science-fiction author Kim Stanley Robinson, and Olympic medalists José Luis Abajo Gómez and Elizabeth Pinedo Sáen."
        meta="Scroll for the full list"
      />

      <section
        ref={ref}
        style={{ backgroundColor: '#FAFAF7', padding: '96px 0 120px' }}
      >
        <div
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        >
          {groups.map((g, i) => (
            <div
              key={g.heading}
              className={`reveal ${isVisible ? 'revealed' : ''}`}
              style={{
                transitionDelay: `${Math.min(i, 6) * 50}ms`,
                paddingTop: 40,
                paddingBottom: 40,
                borderTop: '1px solid #E5E2D9',
                display: 'grid',
                gridTemplateColumns: '1fr 2.4fr',
                gap: 48,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#97B73B',
                    marginBottom: 8,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 'clamp(22px, 2vw, 28px)',
                    lineHeight: 1.2,
                    color: '#0A1628',
                    fontWeight: 400,
                    marginBottom: g.body ? 12 : 0,
                  }}
                >
                  {g.heading}
                </h2>
                {g.body && (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: '#6B7280',
                    }}
                  >
                    {g.body}
                  </p>
                )}
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    color: '#6B7280',
                  }}
                >
                  {g.partners.length} partners
                </p>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px 32px',
                }}
              >
                {g.partners.map((p) => (
                  <li
                    key={p}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14.5,
                      lineHeight: 1.45,
                      color: '#0A1628',
                      paddingLeft: 12,
                      borderLeft: '1px solid #E5E2D9',
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Special supporters */}
      <section
        style={{
          backgroundColor: '#0A1628',
          padding: '96px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '5fr 7fr',
              gap: 64,
              alignItems: 'start',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#97B73B',
                  marginBottom: 16,
                }}
              >
                Special thanks
              </p>
              <h3
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  lineHeight: 1.18,
                  color: '#FAFAF7',
                  fontWeight: 300,
                }}
              >
                Resilience Frontiers would also like to offer special thanks to
                our supporters.
              </h3>
            </div>
            <div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {supporters.map((s) => (
                  <li
                    key={s}
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 28,
                      color: '#FAFAF7',
                      fontWeight: 300,
                      paddingBottom: 12,
                      borderBottom: '1px solid rgba(250,250,247,0.12)',
                    }}
                  >
                    · {s}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: 24,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(250,250,247,0.6)',
                  maxWidth: 540,
                }}
              >
                These contributors and friends of Resilience Frontiers are
                aligned with the vision and approach of the initiative and
                provide valuable input in this shared journey.
              </p>
              <Link
                to="/contact"
                style={{
                  display: 'inline-block',
                  marginTop: 32,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#FAFAF7',
                  border: '1px solid rgba(250,250,247,0.4)',
                  padding: '12px 22px',
                  textDecoration: 'none',
                }}
              >
                Join Resilience Frontiers — contact us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
