import { Outlet } from 'react-router-dom'
import {
  LandingNavbar,
  HeroSection,
  FeaturesSection,
  Interactive3DSection,
  FeaturedProjectsSection,
  SocialProofSection,
  HowItWorksSection,
  ContactRfpSection,
  LandingCtaSection,
  LandingFooter,
} from '../components/landing'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col selection:bg-brand-500/30 selection:text-white antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <LandingNavbar />

      {/* Main landing content */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Modern Dark Construction Footer */}
      <LandingFooter />
    </div>
  )
}

export function LandingPageContent() {
  return (
    <div className="space-y-6 sm:space-y-12 pb-16 overflow-x-hidden">
      {/* 1. Dark Construction Hero Section with 3D Framing Model visual & Stats */}
      <HeroSection />

      {/* 2. Powerful Tools for Modern Construction (4 Cards) */}
      <FeaturesSection />

      {/* 3. Interactive 3D Framing Visualizer (Key showpiece from screenshot) */}
      <Interactive3DSection />

      {/* 4. Featured Projects (Recent Work: Residential, Commercial, Multi-family, Custom) */}
      <FeaturedProjectsSection />

      {/* 5. Field Proof Banner (Built on Accuracy) + What Our Users Say (Testimonials) */}
      <SocialProofSection />

      {/* 6. How It Works (6-step visual workflow) */}
      <HowItWorksSection />

      {/* 7. Get In Touch & Request for Proposal (RFP) */}
      <ContactRfpSection />

      {/* 8. Ready to Get Started Call To Action */}
      <LandingCtaSection />
    </div>
  )
}
