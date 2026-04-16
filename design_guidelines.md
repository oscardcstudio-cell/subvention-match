# Design Guidelines: Subvention Culturelle Matching Platform

## Design Approach: Creative SaaS with Cultural Elegance

**Selected Approach**: Hybrid reference-based drawing from Linear's clean forms, Stripe's payment trust patterns, and Notion's approachable professionalism, elevated with French cultural sophistication.

**Core Principle**: Balance professional credibility (for funding decisions) with creative warmth (for artistic community). Think "gallery meets digital tool."

---

## Color Palette

### Light Mode
- **Primary Brand**: 262 75% 45% (deep artistic purple - sophistication & creativity)
- **Secondary**: 262 65% 35% (darker purple for depth)
- **Accent**: 340 70% 55% (warm rose for CTAs - creative energy)
- **Background**: 0 0% 98% (off-white gallery wall)
- **Surface**: 0 0% 100% (pure white cards)
- **Text Primary**: 262 25% 15% (dark with purple undertone)
- **Text Secondary**: 262 15% 45% (muted purple-gray)
- **Border**: 262 20% 88% (subtle purple-tinted borders)

### Dark Mode
- **Primary Brand**: 262 70% 65% (lighter purple for contrast)
- **Secondary**: 262 60% 55% (mid-tone purple)
- **Accent**: 340 65% 60% (softer rose for dark bg)
- **Background**: 262 20% 8% (deep purple-black)
- **Surface**: 262 15% 12% (elevated purple-gray)
- **Text Primary**: 262 10% 95% (off-white)
- **Text Secondary**: 262 10% 70% (muted light gray)
- **Border**: 262 20% 20% (subtle borders)

---

## Typography

**Font Stack**: 
- Primary: "Inter" (Google Fonts) - clean, professional for forms/UI
- Display: "Playfair Display" (Google Fonts) - elegant serif for headers, adds cultural refinement

**Scale**:
- Hero Display: text-6xl md:text-7xl, font-display, font-bold
- Section Headers: text-3xl md:text-4xl, font-display, font-semibold  
- Form Labels: text-sm, font-medium, tracking-wide, uppercase
- Body Text: text-base, font-primary
- Small/Meta: text-sm, opacity-70

---

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24 (focus on 8, 12, 16 for consistency)

**Container Strategy**:
- Full-width sections: w-full with max-w-7xl mx-auto px-6 md:px-8
- Form container: max-w-4xl (optimal for multi-column form fields)
- Content prose: max-w-3xl for text-heavy sections

**Vertical Rhythm**: py-16 md:py-24 for standard sections, py-20 md:py-32 for hero

---

## Component Library

### Hero Section
- 2-column layout (lg:grid-cols-2): Left side with headline + KPI stats, right side with engaging cultural imagery
- Headline: Large display text with gradient effect (purple to rose)
- 4 KPI cards in 2x2 grid: Each showing metric + label, subtle hover lift effect
- Primary CTA: "Trouver mes subventions" (solid accent color)
- Trust indicator: "342 aides disponibles • Mis à jour quotidiennement"

### Multi-Step Form
- Single page with visual sections, not wizard steps
- Group related fields with subtle background surfaces (surface color)
- 2-column grid for checkboxes (md:grid-cols-2), single column on mobile
- Radio/checkbox custom styling: Purple accent when selected, subtle border otherwise
- Progress indicator: Sticky top bar showing completion (optional scroll spy)
- Form sections: Clear headings with Playfair Display, generous spacing (space-y-8)

### Results Preview Card
- First result: Full visibility with all details
- Remaining results: CSS blur-lg with overlay gradient
- Unlock CTA overlay: Semi-transparent surface with clear pricing "2€ pour accéder aux 15 subventions"
- Result cards: White surface, shadow-md, hover:shadow-lg transition
- Card content: Logo/icon area, title, amount, deadline, tags

### Payment Integration
- Stripe elements in brand colors (purple theme)
- Trust badges: "Paiement sécurisé" with lock icon
- Clear breakdown: "2,00€ • Accès immédiat • Garantie 48h"

### Navigation
- Clean header: Logo left, language toggle (FR/EN) right, sticky on scroll with blur backdrop
- Footer: 3-column layout - About, Quick links, Contact + newsletter signup
- Mobile: Hamburger menu with full-screen overlay

### Supporting Elements
- Feature icons: Use Heroicons (outline style) in brand purple
- Loading states: Subtle purple spinner, skeleton screens for results
- Empty states: Friendly illustration placeholders with soft purple tones
- Toasts/alerts: Rounded, shadow-lg, accent color for success

---

## Animations

**Minimal & Purposeful**:
- Form field focus: Subtle border color transition (duration-200)
- Button hover: Slight scale (hover:scale-105) and brightness shift
- Card hover: Shadow elevation change (duration-300)
- Blur unlock: Smooth blur removal on payment success (duration-500)
- **No** parallax, no complex scroll animations

---

## Images

**Hero Image**: Right side of hero - vibrant cultural imagery showing diverse artists/creative work. Warm, inclusive, inspiring. Size: ~600x700px area

**Supporting Imagery**:
- Trust section: Small partner logos or grant provider badges
- Footer: Optional subtle texture/pattern in brand purple (low opacity)

**Image Treatment**: Subtle rounded corners (rounded-lg), soft shadows, ensure high contrast for overlaid text

---

## Key Page Structures

### Landing Page (6 sections)
1. **Hero**: 2-col with KPIs and main CTA
2. **How It Works**: 3-step process (icons + descriptions, 3-col grid)
3. **Form Preview/Categories**: Visual representation of domains (6-col icon grid)
4. **Pricing/Value**: Clear €2 unlock value proposition with benefits list
5. **Trust/Social Proof**: Stats or testimonials (2-3 col)
6. **FAQ + Footer**: Accordion FAQ, comprehensive footer

### Form Page
- Sticky header with progress
- Clear section breaks with Playfair headings
- Floating submit button (sticky bottom on mobile)

### Results Page  
- Header with search summary
- First result prominent
- Blurred grid of remaining results (grid-cols-1 md:grid-cols-2)
- Centered unlock CTA overlay

---

## Accessibility & Responsiveness

- All form inputs with proper labels and ARIA attributes
- Color contrast ratios ≥ 4.5:1 for text
- Keyboard navigation with visible focus states (ring-2 ring-accent ring-offset-2)
- Mobile-first: Stack all columns to single-col below md breakpoint
- Touch targets: min-h-12 for all interactive elements on mobile
- Language toggle clearly visible, smooth content transition

---

**Design Philosophy**: Create a platform that feels like a "boutique cultural consultancy" - professional enough to trust with funding decisions, beautiful enough to inspire creative confidence. Every interaction should feel curated and purposeful.