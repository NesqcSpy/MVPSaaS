import { AnnouncementBar } from '@/components/landing/announcement-bar';
import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { LogosRow } from '@/components/landing/logos-row';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { Comparison } from '@/components/landing/comparison';
import { Integrations } from '@/components/landing/integrations';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <LandingNav />
      <Hero />
      <LogosRow />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Comparison />
      <Integrations />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
