import PageHero from '../components/page/PageHero';
import EventsSection from '../components/EventsSection';

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title={
          <>
            labs, pavilions
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              and convenings.
            </em>
          </>
        }
        lede="Resilience Frontiers organises and participates in events across climate diplomacy, foresight and culture. The redesigned archive foregrounds the strongest convenings first so the programme reads as a curated body of work, not a feed."
        meta="Pavilions · Labs · Retreats · Receptions"
      />
      <EventsSection />
    </>
  );
}
