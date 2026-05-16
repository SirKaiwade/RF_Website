import { Link } from 'react-router-dom';
import PageHero from '../components/page/PageHero';

export default function NotFoundPage() {
  return (
    <>
      <PageHero
        eyebrow="404 — Page not found"
        title={
          <>
            this page is
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              still in the future.
            </em>
          </>
        }
        lede="The page you tried to reach doesn’t exist yet — but the rest of Resilience Frontiers does."
      />
      <section style={{ backgroundColor: '#FAFAF7', padding: '96px 0 120px' }}>
        <div
          style={{
            maxWidth: 980,
            margin: '0 auto',
            padding: '0 48px',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" className="btn-primary">
            Return home →
          </Link>
          <Link to="/pathways" className="btn-secondary">
            Eight pathways
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact
          </Link>
        </div>
      </section>
    </>
  );
}
