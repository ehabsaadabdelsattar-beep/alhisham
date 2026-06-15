import React from 'react';
import SEO from '../components/ui/SEO';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import AboutSection from '../components/sections/AboutSection';
import TimelineSection from '../components/sections/TimelineSection';
import ServicesSection from '../components/sections/ServicesSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import BeforeAfterSection from '../components/sections/BeforeAfterSection';
import PartnersSection from '../components/sections/PartnersSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import BlogSection from '../components/sections/BlogSection';
import FAQSection from '../components/sections/FAQSection';
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
      <FeaturesSection />
      <AboutSection />
      <TimelineSection />
      <ServicesSection />
      <ProjectsSection />
      <BeforeAfterSection />
      <PartnersSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
