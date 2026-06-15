import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import AboutSection from '../components/sections/AboutSection';
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
      <Helmet>
        <title>الهشام للتطوير العقاري | AL HISHAM DEVELOPMENT</title>
        <meta name="description" content="شركة الهشام للتطوير العقاري - نبني المستقبل ونصنع قيمة عقارية مستدامة. مشاريع سكنية وتجارية فاخرة، استشارات هندسية، إدارة أصول عقارية." />
        <link rel="canonical" href="https://alhishamdevelopment.com/" />
      </Helmet>
      <HeroSection />
      <StatsSection />
      <AboutSection />
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
