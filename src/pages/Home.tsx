import React from 'react';
import SEO from '../components/ui/SEO';
import HeroSection from '../components/sections/HeroSection';
import LuxuryMarquee from '../components/sections/LuxuryMarquee';
import StatsSection from '../components/sections/StatsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ResidencesShowcase from '../components/sections/ResidencesShowcase';
import AmenitiesSection from '../components/sections/AmenitiesSection';
import LifestyleSection from '../components/sections/LifestyleSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import InvestmentSection from '../components/sections/InvestmentSection';
import BlogSection from '../components/sections/BlogSection';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <>
      <SEO 
        title="الهشام للتطوير العقاري | مشاريع سكنية وتجارية فاخرة" 
        description="شركة الهشام للتطوير العقاري - نبني المستقبل ونبتكر قيمة عقارية مستدامة. مشاريع استثنائية، تشطيبات فندقية راقية، وإدارة أصول عقارية رائدة." 
      />
      <HeroSection />
      <LuxuryMarquee theme="ivory" />
      <StatsSection />
      <ProjectsSection />
      <ResidencesShowcase />
      <AmenitiesSection />
      <LifestyleSection />
      <AboutSection />
      <ServicesSection />
      <InvestmentSection />
      <BlogSection />
      <CTASection />
    </>
  );
}
