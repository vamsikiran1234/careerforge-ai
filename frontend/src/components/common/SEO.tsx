import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  title = 'CareerForge AI - AI-Powered Career Guidance',
  description = 'Transform your career with AI-powered guidance, skill assessments, mentor connections, and personalized recommendations.',
  keywords = 'career guidance, AI career coaching, skill assessment, mentor matching, career development, professional growth',
  image = '/images/og-image.png',
  url = window.location.href,
  type = 'website',
}) => {
  const fullTitle = title === 'CareerForge AI - AI-Powered Career Guidance' 
    ? title 
    : `${title} | CareerForge AI`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'CareerForge AI');

    // Open Graph
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'CareerForge AI', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', url, true);
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Theme
    updateMetaTag('theme-color', '#3B82F6');

    // Structured Data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    
    structuredDataScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "CareerForge AI",
      "description": description,
      "url": "https://careerforge.ai",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "category": "CareerGuidance",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "CareerForge AI"
      }
    });

  }, [fullTitle, description, keywords, image, url, type]);

  return null; // This component doesn't render anything visible
};

// Helper function to generate page-specific SEO
export const createSEO = {
  dashboard: () => (
    <SEO 
      title="Dashboard"
      description="Track your career progress, view analytics, and get personalized insights on your professional development journey."
      keywords="career dashboard, progress tracking, analytics, career insights"
    />
  ),

  chat: () => (
    <SEO 
      title="AI Career Chat"
      description="Get personalized career advice and guidance from our advanced AI assistant. Ask questions about career paths, skills, and professional development."
      keywords="AI career chat, career advice, AI coaching, career guidance"
    />
  ),

  quiz: () => (
    <SEO 
      title="Career Assessment"
      description="Take comprehensive career assessments to discover your strengths, interests, and ideal career paths with our AI-powered quiz system."
      keywords="career assessment, career quiz, skill evaluation, career test"
    />
  ),

  mentors: () => (
    <SEO 
      title="Find Mentors"
      description="Connect with industry experts and experienced professionals who can guide your career growth. Browse, filter, and book sessions with top mentors."
      keywords="career mentors, professional mentoring, industry experts, career guidance"
    />
  ),

  profile: () => (
    <SEO 
      title="Profile"
      description="Manage your career profile, track your progress, and customize your learning preferences."
      keywords="career profile, user profile, career settings"
    />
  ),

  login: () => (
    <SEO 
      title="Login"
      description="Sign in to your CareerForge AI account to access personalized career guidance, mentors, and track your professional development."
      keywords="login, sign in, account access"
    />
  ),

  register: () => (
    <SEO 
      title="Create Account"
      description="Join CareerForge AI and start your personalized career development journey with AI-powered guidance and expert mentors."
      keywords="register, sign up, create account, join"
    />
  ),
};

export default SEO;
