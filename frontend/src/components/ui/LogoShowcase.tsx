import React from 'react';
import { Logo } from './Logo';
import { BrandLogo, HeaderLogo, SidebarLogo, FooterLogo, FaviconLogo } from './BrandLogo';

export const LogoShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          CareerForge AI - Logo System
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Professional, modern, and scalable logo variants for all use cases
        </p>

        {/* Original Logo Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Enhanced Original Logo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Full Logos */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Full Logo - Large</h3>
              <Logo size="xl" variant="full" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Full Logo - Medium</h3>
              <Logo size="md" variant="full" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Full Logo - Small</h3>
              <Logo size="sm" variant="full" />
            </div>

            {/* Icon Only */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Icon Only - Large</h3>
              <Logo size="xl" variant="icon" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Icon Only - Medium</h3>
              <Logo size="md" variant="icon" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Icon Only - Small</h3>
              <Logo size="sm" variant="icon" />
            </div>

            {/* Text Only */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Text Only - Large</h3>
              <Logo size="xl" variant="text" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Text Only - Medium</h3>
              <Logo size="md" variant="text" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Minimal</h3>
              <Logo size="md" variant="minimal" />
            </div>
          </div>
        </section>

        {/* New Brand Logo Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            New Professional Brand System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Default Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Default - Gradient</h3>
              <BrandLogo size="lg" variant="default" theme="gradient" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Default - Light</h3>
              <BrandLogo size="lg" variant="default" theme="light" />
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Default - Dark</h3>
              <BrandLogo size="lg" variant="default" theme="dark" />
            </div>

            {/* Wordmark Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Wordmark - Gradient</h3>
              <BrandLogo size="lg" variant="wordmark" theme="gradient" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Wordmark - Light</h3>
              <BrandLogo size="lg" variant="wordmark" theme="light" />
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Wordmark - Monochrome</h3>
              <BrandLogo size="lg" variant="wordmark" theme="monochrome" />
            </div>

            {/* Symbol & Monogram */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Symbol Only</h3>
              <BrandLogo size="lg" variant="symbol" theme="gradient" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Monogram</h3>
              <BrandLogo size="lg" variant="monogram" theme="light" />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Compact</h3>
              <BrandLogo size="lg" variant="compact" theme="gradient" />
            </div>
          </div>
        </section>

        {/* Preset Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Ready-to-Use Presets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Header Logo</h3>
              <HeaderLogo />
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Sidebar Logo</h3>
              <SidebarLogo />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Footer Logo</h3>
              <FooterLogo />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Favicon Logo</h3>
              <FaviconLogo />
            </div>
          </div>
        </section>

        {/* Size Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Size Variations
          </h2>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
            <div className="flex flex-wrap items-end gap-8">
              <div className="text-center">
                <BrandLogo size="xs" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">XS</p>
              </div>
              <div className="text-center">
                <BrandLogo size="sm" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">SM</p>
              </div>
              <div className="text-center">
                <BrandLogo size="md" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">MD</p>
              </div>
              <div className="text-center">
                <BrandLogo size="lg" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">LG</p>
              </div>
              <div className="text-center">
                <BrandLogo size="xl" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">XL</p>
              </div>
              <div className="text-center">
                <BrandLogo size="2xl" variant="default" theme="gradient" />
                <p className="text-xs text-gray-500 mt-2">2XL</p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Usage Guidelines
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">When to Use Each Variant</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><strong>Header Logo:</strong> Navigation bars, top headers</li>
                  <li><strong>Sidebar Logo:</strong> Collapsed sidebars, mobile nav</li>
                  <li><strong>Footer Logo:</strong> Page footers, documentation</li>
                  <li><strong>Favicon Logo:</strong> Browser tabs, app icons</li>
                  <li><strong>Wordmark:</strong> Marketing materials, presentations</li>
                  <li><strong>Symbol:</strong> Social media profiles, app icons</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Specifications</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><strong>Colors:</strong> Blue (#3B82F6) to Purple (#8B5CF6) gradient</li>
                  <li><strong>Typography:</strong> Inter font family, bold weight</li>
                  <li><strong>Minimum Size:</strong> 16px for symbols, 20px for full logos</li>
                  <li><strong>Clear Space:</strong> 0.5x logo height on all sides</li>
                  <li><strong>Formats:</strong> SVG (preferred), PNG with transparency</li>
                  <li><strong>Accessibility:</strong> WCAG AA compliant contrast ratios</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LogoShowcase;