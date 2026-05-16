import PageHero from '../components/page/PageHero';
import NewsHighlights from '../components/NewsHighlights';

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="News"
        title={
          <>
            updates, coverage
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              and highlights.
            </em>
          </>
        }
        lede="The latest Resilience Frontiers news spans cultural collaborations, climate fiction, COP coverage and editorial reflections. The redesigned page treats the archive like a publication front, with clearer hierarchy and stronger reading rhythm."
        meta="Lead story · Dispatches · Independent coverage"
      />
      <NewsHighlights />
    </>
  );
}
