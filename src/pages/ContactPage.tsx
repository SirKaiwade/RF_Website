import PageHero from '../components/page/PageHero';
import ContactSection from '../components/ContactSection';

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            stay in touch with
            <br />
            <em style={{ fontStyle: 'italic', color: '#5B8FB9' }}>
              the initiative.
            </em>
          </>
        }
        lede="To get in touch email rf@unfccc.int. Use the form below for press enquiries, partnerships, newsletter requests and general questions."
        meta="Press · Partnership · Programme · Newsletter · General"
      />
      <ContactSection />
    </>
  );
}
