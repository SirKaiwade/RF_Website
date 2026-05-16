import { Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/page/ScrollToTop';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import InspirationsPage from './pages/InspirationsPage';
import InvestedActorsPage from './pages/InvestedActorsPage';
import TimelinePage from './pages/TimelinePage';
import PathwaysPage from './pages/PathwaysPage';
import PathwayStorylinesPage from './pages/PathwayStorylinesPage';
import EventsPage from './pages/EventsPage';
import NewsPage from './pages/NewsPage';
import InsightsPage from './pages/InsightsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div style={{ backgroundColor: '#FAFAF7', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/inspirations" element={<InspirationsPage />} />
          <Route path="/invested-actors" element={<InvestedActorsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/pathways" element={<PathwaysPage />} />
          <Route path="/pathway-storylines" element={<PathwayStorylinesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
