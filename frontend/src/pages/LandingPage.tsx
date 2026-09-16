import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { DiseaseStagesSection } from '../components/landing/DiseaseStagesSection';
import { WorkflowSection } from '../components/landing/WorkflowSection';

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans scroll-smooth bg-light-bg">
      <Navbar />
      <main>
        <HeroSection />
        <DiseaseStagesSection />
        <WorkflowSection />
      </main>
      <Footer />
    </div>
  );
}
