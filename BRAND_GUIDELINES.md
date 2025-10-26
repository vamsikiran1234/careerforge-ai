# CareerForge AI - Brand Guidelines

## 🎨 Logo System Overview

CareerForge AI features a modern, professional logo system designed for scalability and versatility across all digital platforms. The logo combines career growth symbolism with AI technology elements.

## 📐 Logo Variants

### 1. **Primary Logo (Default)**
- **Usage**: Main brand representation, headers, marketing materials
- **Components**: Symbol + wordmark + tagline
- **Minimum size**: 120px width
- **File formats**: SVG (preferred), PNG with transparency

### 2. **Compact Logo**
- **Usage**: Navigation bars, limited space applications
- **Components**: Symbol + wordmark (no tagline)
- **Minimum size**: 80px width

### 3. **Wordmark Only**
- **Usage**: Text-heavy layouts, footer applications
- **Components**: CareerForge + AI Platform tagline
- **Minimum size**: 60px width

### 4. **Symbol Only**
- **Usage**: App icons, social media profiles, favicons
- **Components**: Career growth steps + AI node
- **Minimum size**: 16px (for favicons)

### 5. **Monogram**
- **Usage**: Extremely limited space, loading indicators
- **Components**: "CF" letters in branded container
- **Minimum size**: 16px

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#3B82F6` (rgb(59, 130, 246))
- **Primary Indigo**: `#6366F1` (rgb(99, 102, 241))
- **Primary Purple**: `#8B5CF6` (rgb(139, 92, 246))

### Gradient
- **Main Gradient**: Linear gradient from Blue → Indigo → Purple
- **CSS**: `background: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)`

### Supporting Colors
- **Success Green**: `#10B981` (rgb(16, 185, 129))
- **Warning Amber**: `#F59E0B` (rgb(245, 158, 11))
- **Error Red**: `#EF4444` (rgb(239, 68, 68))

### Neutral Colors
- **Gray 50**: `#F9FAFB` (Light backgrounds)
- **Gray 100**: `#F3F4F6` (Subtle backgrounds)
- **Gray 500**: `#6B7280` (Secondary text)
- **Gray 900**: `#111827` (Primary text)

## 📝 Typography

### Primary Font
- **Font Family**: Inter
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Usage**: All UI text, headings, body content

### Monospace Font
- **Font Family**: JetBrains Mono
- **Usage**: Code snippets, technical content
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold)

## 🎯 Logo Usage Guidelines

### ✅ DO
- Use the gradient version on light backgrounds
- Maintain minimum clear space (0.5x logo height on all sides)
- Use monogram for very small applications (< 32px)
- Ensure sufficient contrast for accessibility
- Use SVG format when possible for crisp rendering

### ❌ DON'T
- Stretch or distort the logo proportions
- Use the logo on busy or low-contrast backgrounds
- Place text too close to the logo
- Use outdated or low-resolution versions
- Modify colors outside the approved palette

## 📱 Platform-Specific Applications

### Web Applications
- **Header**: Compact logo (80-120px width)
- **Sidebar**: Monogram when collapsed, compact when expanded
- **Footer**: Wordmark or compact logo
- **Loading screens**: Symbol with animation

### Mobile Applications
- **App Icon**: Symbol only (1024×1024px for iOS, 512×512px for Android)
- **Splash Screen**: Primary logo centered
- **Navigation**: Monogram or symbol

### Social Media
- **Profile Pictures**: Symbol only (square format)
- **Cover Images**: Primary logo with brand colors
- **Posts**: Compact or wordmark depending on layout

### Print Materials
- **Business Cards**: Compact or wordmark
- **Letterhead**: Wordmark in header
- **Presentations**: Primary logo on title slides, symbol on content slides

## 🔧 Technical Specifications

### File Naming Convention
```
careerforge-logo-[variant]-[size]-[theme].[ext]
```

Examples:
- `careerforge-logo-primary-lg-gradient.svg`
- `careerforge-logo-symbol-32-light.png`
- `careerforge-logo-wordmark-md-dark.svg`

### Export Settings
- **SVG**: Optimize for web, remove unnecessary metadata
- **PNG**: 24-bit with transparency, 2x resolution for retina displays
- **Favicon**: Multiple sizes (16, 32, 48, 64, 128, 256px)

### Accessibility
- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Alt Text**: "CareerForge AI logo" or descriptive text based on context
- **Focus States**: Visible focus indicators for interactive logo elements

## 🎨 Theme Variations

### Light Theme
- **Background**: White or light gray
- **Logo**: Gradient version
- **Text**: Dark gray (#111827)

### Dark Theme
- **Background**: Dark gray or black
- **Logo**: Light version with white elements
- **Text**: Light gray (#F9FAFB)

### Monochrome
- **Usage**: Single-color applications, embossing, watermarks
- **Colors**: Black, white, or single brand color

## 📊 Logo Performance Metrics

### Loading Performance
- **SVG Size**: < 5KB optimized
- **PNG Size**: < 20KB for standard sizes
- **WebP Support**: Provide WebP alternatives for better compression

### Accessibility Compliance
- **WCAG 2.1 AA**: All logo applications meet accessibility standards
- **Screen Readers**: Proper alt text and semantic markup
- **High Contrast**: Alternative versions for high contrast mode

## 🚀 Implementation Examples

### React Component Usage
```tsx
import { BrandLogo } from './components/ui/BrandLogo';

// Header usage
<BrandLogo size="md" variant="compact" theme="gradient" animated />

// Sidebar usage
<BrandLogo size="sm" variant="monogram" theme="dark" />

// Footer usage
<BrandLogo size="lg" variant="wordmark" theme="monochrome" />
```

### CSS Implementation
```css
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-gradient {
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 📋 Brand Checklist

Before using the CareerForge AI logo, ensure:

- [ ] Correct variant for the use case
- [ ] Appropriate size and resolution
- [ ] Sufficient contrast and readability
- [ ] Proper clear space maintained
- [ ] Accessibility requirements met
- [ ] File format optimized for platform
- [ ] Brand guidelines followed

## 📞 Brand Support

For questions about logo usage, brand guidelines, or to request custom logo variations, please contact the development team or refer to the logo showcase component in the application.

---

*Last updated: October 2024*
*Version: 2.0*