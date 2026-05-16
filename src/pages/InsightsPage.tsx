import PageHero from '../components/page/PageHero';
import InsightsSection from '../components/InsightsSection';

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            LEAP editions
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              and essays.
            </em>
          </>
        }
        lede="LEAP is Resilience Frontiers’ edition-led channel of insights. Each release gathers essays, provocations and editorial reflections into a curated issue, so the page reads like a publication rather than a feed."
        meta="Two editions · 10 pieces"
      />
      <InsightsSection />
    </>
  );
}
