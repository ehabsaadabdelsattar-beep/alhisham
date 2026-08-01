import React from 'react';
import SEO from '../components/ui/SEO';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import InvestmentSection from '../components/sections/InvestmentSection';
import BlogSection from '../components/sections/BlogSection';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <>
      <SEO 
        title="الرئيسية" 
        description="شركة الهشام للتطوير العقاري - نبني المستقبل ونصنع قيمة عقارية مستدامة. مشاريع سكنية وتجارية فاخرة، استشارات هندسية، إدارة أصول عقارية." 
      />
      <HeroSection />
      <StatsSection />
      <ProjectsSection />
      <AboutSection />
      <ServicesSection />
      <InvestmentSection />
      <BlogSection />
      <CTASection />
    </>
  );
}
