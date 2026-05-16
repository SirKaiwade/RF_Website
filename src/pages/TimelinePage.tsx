import PageHero from '../components/page/PageHero';
import TimeHorizon from '../components/TimeHorizon';

export default function TimelinePage() {
  return (
    <>
      <PageHero
        eyebrow="Timeline — 2018–2023 Milestones"
        title={
          <>
            key milestones across
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              the initiative.
            </em>
          </>
        }
        lede="A live record of the meetings, labs, dialogues and COP convenings that shaped Resilience Frontiers from 2018 to 2023."
        meta="16 live milestones — meetings, labs, dialogues and COP convenings"
      />
      <TimeHorizon />
    </>
  );
}
