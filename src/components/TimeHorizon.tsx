import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface Milestone {
  date: string;
  year: string;
  title: string;
  description: string;
  type: 'Pavilion' | 'Lab' | 'Brainstorming' | 'Reception' | 'Retreat' | 'Roadmapping' | 'Dialogue' | 'Interagency' | 'Programme';
}

const milestones: Milestone[] = [
  {
    date: 'Dec 2, 2023',
    year: '2023',
    title: 'Pavilion and events at COP 28, Dubai',
    description:
      'The Resilience Frontiers Pavilion was back at COP 28 in Dubai, UAE with an exciting programme of events.',
    type: 'Pavilion',
  },
  {
    date: 'Aug 28, 2023',
    year: '2023',
    title: 'Working Session, Songdo',
    description:
      'Resilience Frontiers was relaunched in Songdo when a group of over 100 leading thinkers came together.',
    type: 'Lab',
  },
  {
    date: 'Nov 7, 2022',
    year: '2022',
    title: 'Pavilion at COP 27, Sharm El Sheikh',
    description:
      'The Resilience Frontiers pavilion at COP 27 in Sharm el-Sheikh, Egypt hosted a packed programme of creative sessions.',
    type: 'Pavilion',
  },
  {
    date: 'Aug 22, 2022',
    year: '2022',
    title: 'Second brainstorming meeting, Gaborone',
    description:
      'The second Resilience Frontiers brainstorming meeting took place in Gaborone, held at the Botswana Global Adaptation Week.',
    type: 'Brainstorming',
  },
  {
    date: 'Jun 8, 2022',
    year: '2022',
    title: 'Stakeholder engagement reception, Bonn',
    description:
      'A successful stakeholder engagement reception in Bonn in June 2022 to share reflections on transforming systems.',
    type: 'Reception',
  },
  {
    date: 'Feb 7, 2022',
    year: '2022',
    title: 'Strategy retreat, Bonn',
    description:
      'A strategy session with various stakeholders took place at the UN Campus in Bonn, February 2022.',
    type: 'Retreat',
  },
  {
    date: 'Nov 1, 2021',
    year: '2021',
    title: 'Pavilion at COP 26, Glasgow',
    description:
      'Resilience Frontiers hosted the Resilience Lab at COP26, from November 1 to 11, 2021, with friends, colleagues and collaborators.',
    type: 'Pavilion',
  },
  {
    date: 'Sep 17, 2020',
    year: '2020',
    title: 'Virtual Resilience Lab Series #3',
    description:
      'Part III of the Virtual Resilience Lab series took place on 17–18 September and focused on long-term regenerative resilience.',
    type: 'Lab',
  },
  {
    date: 'Sep 2, 2020',
    year: '2020',
    title: 'Virtual Resilience Lab Series #2',
    description:
      'Part II of the Virtual Resilience Lab series took place on 2–3 September and focused on retooling global cooperation.',
    type: 'Lab',
  },
  {
    date: 'Jul 29, 2020',
    year: '2020',
    title: 'Virtual Resilience Lab Series #1',
    description:
      'Resilience Frontiers convened the Virtual Resilience Lab series between July and September 2020 as a continuation of its effort.',
    type: 'Lab',
  },
  {
    date: 'Feb 3, 2020',
    year: '2020',
    title: 'Roadmapping meeting, Bonn',
    description:
      'In February 2020, Resilience Frontiers hosted a roadmapping meeting in Bonn, Germany and fine-tuned the methodology.',
    type: 'Roadmapping',
  },
  {
    date: 'Dec 2, 2019',
    year: '2019',
    title: 'Pavilion at COP 25, Madrid',
    description:
      'For the first time, COP 25 featured a Resilience Frontiers Pavilion — a focal point for future thinking approaches.',
    type: 'Pavilion',
  },
  {
    date: 'Nov 10, 2019',
    year: '2019',
    title: 'UN interagency meeting, Bonn',
    description:
      'In November 2019, a UN interagency meeting assembled a critical mass of representatives from UN organizations.',
    type: 'Interagency',
  },
  {
    date: 'Oct 19, 2019',
    year: '2019',
    title: 'Resilience Frontiers dialogues, Madrid',
    description:
      'During the Asia Pacific Climate Week, the Resilience Frontiers team hosted a dialogue on indigenous values.',
    type: 'Dialogue',
  },
  {
    date: 'Apr 8, 2019',
    year: '2019',
    title: 'First brainstorming meeting, Songdo',
    description:
      'Resilience Frontiers had its first brainstorming meeting in Songdo from 8–12 April 2019. This was the launchpad event.',
    type: 'Brainstorming',
  },
  {
    date: 'Dec 2, 2018',
    year: '2018',
    title: 'Preparatory meetings at COP 24, Katowice',
    description:
      'Preparatory meetings held at COP 24 in 2018 laid the foundations for the initiative that became Resilience Frontiers.',
    type: 'Programme',
  },
];

const yearGroups = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
  acc[m.year] = acc[m.year] ?? [];
  acc[m.year].push(m);
  return acc;
}, {});

const years = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

export default function TimeHorizon() {
  const { ref, isVisible } = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      id="timeline"
      style={{
        backgroundColor: '#0A1628',
        padding: '120px 0',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical rule */}
          <div
            style={{
              position: 'absolute',
              left: 110,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: 'rgba(250, 250, 247, 0.12)',
            }}
            aria-hidden="true"
          />

          {years.map((year, yIdx) => (
            <div key={year} style={{ marginBottom: 56 }}>
              {/* Year marker */}
              <div
                className={`reveal ${isVisible ? 'revealed' : ''}`}
                style={{
                  transitionDelay: `${yIdx * 60}ms`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 48,
                    fontWeight: 300,
                    color: '#FAFAF7',
                    width: 110,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {year}
                </span>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#97B73B',
                    transform: 'translateX(-6px)',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: 'rgba(250,250,247,0.12)',
                  }}
                />
              </div>

              {/* Year items */}
              {yearGroups[year].map((m, i) => (
                <div
                  key={m.date}
                  className={`reveal ${isVisible ? 'revealed' : ''}`}
                  style={{
                    transitionDelay: `${yIdx * 60 + i * 80 + 60}ms`,
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    gap: 16,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: 24,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      paddingTop: 4,
                      paddingRight: 16,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'rgba(250,250,247,0.45)',
                      }}
                    >
                      {m.date}
                    </span>
                  </div>
                  <div
                    style={{
                      paddingLeft: 24,
                      borderLeft: '1px solid rgba(250,250,247,0.12)',
                      marginLeft: -1,
                      position: 'relative',
                    }}
                  >
                    {/* Bullet */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -4,
                        top: 8,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#FAFAF7',
                        opacity: 0.7,
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#5B8FB9',
                        marginBottom: 4,
                        display: 'inline-block',
                      }}
                    >
                      {m.type}
                    </span>
                    <h3
                      style={{
                        fontFamily: 'Fraunces, Georgia, serif',
                        fontSize: 22,
                        lineHeight: 1.2,
                        color: '#FAFAF7',
                        fontWeight: 400,
                        margin: '4px 0 8px',
                      }}
                    >
                      {m.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: 'rgba(250,250,247,0.55)',
                        maxWidth: 720,
                      }}
                    >
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          className={`reveal ${isVisible ? 'revealed' : ''}`}
          style={{ marginTop: 24 }}
        >
          <a
            href="https://resiliencefrontiers.org/timeline/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#FAFAF7',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '14px 24px',
              border: '1px solid rgba(250, 250, 247, 0.3)',
              textDecoration: 'none',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                'rgba(250, 250, 247, 0.7)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                'rgba(250, 250, 247, 0.3)')
            }
          >
            View full timeline →
          </a>
        </div>
      </div>
    </section>
  );
}
