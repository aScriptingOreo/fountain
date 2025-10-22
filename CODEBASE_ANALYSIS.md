# Slick Portfolio - Svelte 5 Codebase Analysis

## Project Overview

**Slick Portfolio with Svelte 5** is a modern, responsive developer portfolio website template built with:
- **Svelte 5** - Latest reactive framework
- **SvelteKit** - Full-stack web framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **UnoCSS** - Alternative utility CSS engine
- **Bits UI** - Headless UI components
- **Marked** - Markdown parser
- **Prism.js** - Code syntax highlighting

The portfolio is designed to showcase a developer's skills, projects, experience, and education in an elegant, interactive way.

---

## Architecture Overview

### Directory Structure

```
src/
├── app.css                      # Global styles with Tailwind
├── app.html                     # HTML entry point
├── markdown.css                 # Markdown-specific styles
├── lib/
│   ├── data/                    # Data models and content
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── base.ts              # User base info (name, suffix)
│   │   ├── home.ts              # Home page data
│   │   ├── skills.ts            # Skills with categories
│   │   ├── projects.ts          # Projects list
│   │   ├── experience.ts        # Work experience
│   │   ├── education.ts         # Education background
│   │   ├── assets.ts            # Logo and asset references
│   │   ├── colors.ts            # Color palette
│   │   ├── nav-bar.ts           # Navigation items
│   │   ├── resume.ts            # Resume data
│   │   └── md/                  # Markdown files
│   ├── components/
│   │   ├── common/              # Reusable page components
│   │   ├── ui/                  # Shadcn-style UI primitives
│   │   ├── projects/            # Project-specific components
│   │   ├── experience/          # Experience-specific components
│   │   └── education/           # Education-specific components
│   ├── utils.ts                 # Utility functions
│   └── index.ts                 # Library entry point
├── routes/
│   ├── +layout.svelte           # Root layout with nav
│   ├── +layout.ts               # Layout data loading
│   ├── +page.svelte             # Home page
│   ├── skills/
│   │   ├── +page.svelte         # Skills list with search
│   │   └── [slug]/
│   │       ├── +page.svelte     # Individual skill detail
│   │       └── +page.ts         # Skill data loader
│   ├── projects/
│   │   ├── +page.svelte         # Projects list with filters
│   │   └── [slug]/
│   │       ├── +page.svelte     # Project detail
│   │       └── +page.ts         # Project data loader
│   ├── experience/
│   │   ├── +page.svelte         # Experience list
│   │   └── [slug]/
│   │       ├── +page.svelte     # Experience detail
│   │       └── +page.ts         # Experience data loader
│   ├── education/
│   │   ├── +page.svelte         # Education list
│   │   └── [slug]/
│   │       ├── +page.svelte     # Education detail
│   │       └── +page.ts         # Education data loader
│   ├── resume/
│   │   └── +page.svelte         # Resume page
│   └── search/
│       └── +page.svelte         # Global search across all content
```

---

## Core Concepts

### 1. Data Layer (`src/lib/data/`)

The entire portfolio content is managed through TypeScript data files:

#### Type System (`types.ts`)
```typescript
// Enums for configuration
enum Platform { GitHub, StackOverflow, Twitter, LinkedIn, Email, Facebook, Youtube }
enum ContractType { FullTime, PartTime, SelfEmployed, Freelance, Contract, Internship }

// Generic Item interface (base for all content)
interface Item<S extends string = string> {
  slug: S                     // Unique identifier
  name: string
  logo: Asset                 // { light: string; dark: string }
  shortDescription: string
  description: string
  screenshots?: Screenshot[]
}

// Specialized interfaces extending Item
interface Skill extends Item { color: string; category?: SkillCategory }
interface Project extends Item { 
  links: Link[]
  color: Color
  period: { from: Date; to?: Date }
  type: string
  skills: Skill[]
}
interface Experience extends Project {
  company: string
  location: string
  contract: ContractType
}
interface Education extends Item {
  organization: string
  location: string
  period: { from: Date; to?: Date }
  subjects: string[]
  degree: string
}
```

#### Data Organization

**`skills.ts`**: Skills with categorization
- Defines skill categories (Programming Languages, Frameworks, Libraries, etc.)
- Helper functions:
  - `getSkills(...slugs)` - Filter skills by slug
  - `groupByCategory(query)` - Group and search skills

**`projects.ts`**: Portfolio projects
- Each project includes skills used, links, type, period, and description

**`experience.ts`**: Work history
- Company, contract type, duration, and associated skills

**`education.ts`**: Educational background
- Organization, degree, subjects, and period

**`assets.ts`**: Logo references
- Maps asset names to light/dark image URLs
- Supports theme-aware rendering

---

### 2. Component Architecture

#### UI Components (`src/lib/components/ui/`)

Built on **Bits UI** (headless components) with Tailwind styling:

**Primitive Components:**
- `button/` - Customizable button with variants (default, ghost, outline)
- `card/` - Base card container with fancy hover effects
- `badge/` - Small tag/label component
- `avatar/` - Image with fallback support
- `input/` - Form input field
- `label/` - Form label
- `separator/` - Visual divider
- `icon/` - Icon wrapper (uses Iconify Carbon)
- `tooltip/` - Contextual hints
- `dialog/` - Modal/dialog system
- `dropdown-menu/` - Dropdown menu
- `carousel/` - Image/content carousel (using Embla)
- `toggle/` - Toggle button
- `toggle-group/` - Multiple toggles
- `responsive-container/` - Responsive layout wrapper
- `pagination/` - Page navigation
- `popover/` - Floating content
- `hover-card/` - Hover preview
- `sonner/` - Toast notifications
- `typography/` - Text components (H1, H2, H3, H4, Large, Muted, etc.)

**FancyCard Component** (`ui/card/fancy-card.svelte`)
Premium feature with:
- 3D tilt effect on hover
- Color-based background gradients
- Radial glow effect at cursor position
- Dynamic color opacity calculations
- Optional background image overlay
- Supports `href` for link cards

```typescript
// FancyCard uses Riadh's utility library
- changeColorOpacity() - Dynamic color manipulation
- isHexColor() - Color validation
```

#### Common Components (`src/lib/components/common/`)

High-level page components:

**`base-page.svelte`**
- Wrapper with title and responsive container
- Used by detail pages (skills, projects, etc.)

**`search-page.svelte`**
- Layout with search input
- Used by list pages

**`nav-bar.svelte`**
- Fixed header navigation
- Mobile-responsive with dialog menu
- Theme toggle (light/dark)
- Dynamic routing with `href()` utility

**`fancy-banner.svelte`**
- Hero banner with background image
- Content overlay support

**`markdown.svelte`**
- Renders markdown with:
  - Syntax highlighting (Prism.js)
  - GFM heading IDs (Table of Contents support)
  - Mangle plugin (XSS protection with marked-mangle)
  - DOMPurify sanitization

**`title.svelte`**
- Page title component

**`empty-result.svelte`**
- Placeholder for no search results

**`screenshot.svelte`**
- Image gallery card

#### Feature Components

**`projects/project-card.svelte`** - Card for project listing
**`experience/experience-card.svelte`** - Card for experience listing
**`education/education-card.svelte`** - Card for education listing

---

### 3. Routing System (SvelteKit)

#### Static Site Generation
```javascript
// svelte.config.js
adapter: adapter({ fallback: '404.html' })  // Static adapter for deployment
paths: { base: '/slick-portfolio-svelte-5' } // GitHub Pages base path
```

#### Route Structure

**`+layout.svelte` (Root)**
- Global layout with ModeWatcher (theme detection)
- Fixed NavBar component
- CSR-only: `export const ssr = false`

**Home Page (`+page.svelte`)**
- Hero section with title and description
- Embla carousel of featured skills
- Auto-rotating carousel (2s interval)
- Social links (GitHub, LinkedIn, Twitter, Email)

**Skills Page**
- List: `/skills/+page.svelte` - Searchable skills grid by category
- Detail: `/skills/[slug]/+page.svelte` - Individual skill page
  - Shows related projects and experiences using that skill
  - Markdown description support

**Projects Page**
- List: `/projects/+page.svelte` - Filterable project grid
  - Filters by skill (toggleable)
  - Full-text search
- Detail: `/projects/[slug]/+page.svelte` - Project showcase
  - Links (GitHub, Demo, etc.)
  - Associated skills
  - Screenshots carousel
  - Duration display

**Experience Page**
- List: `/experience/+page.svelte` - Work history
- Detail: `/experience/[slug]/+page.svelte` - Job details
  - Company name and location
  - Contract type
  - Skills used
  - Duration calculation

**Education Page**
- List: `/education/+page.svelte` - Education history
- Detail: `/education/[slug]/+page.svelte` - School details
  - Degree and organization
  - Subjects studied
  - Duration

**Resume Page**
- `/resume/+page.svelte` - Downloadable/printable resume

**Search Page**
- Global search across Skills, Projects, Experience, Education
- Multi-category result grouping
- Faceted search results

---

### 4. Styling System

#### Tailwind CSS Configuration

**Color Scheme (Light/Dark Modes)**
```css
:root (Light Mode)
--background: hsl(243, 0%, 100%)      /* White */
--foreground: hsl(243, 0%, 10%)       /* Dark */
--card: hsl(243, 0%, 100%)
--primary: hsl(243, 0%, 4%)           /* Almost black */

.dark (Dark Mode)
--background: hsl(0, 0%, 0%)          /* Black */
--foreground: hsl(243, 0%, 90%)       /* Light */
--card: hsl(243, 0%, 0%)              /* Black */
--primary: hsl(243, 0%, 100%)         /* White */
```

**Theme-Aware Rendering**
```typescript
import { mode } from 'mode-watcher'
// Use: $mode === 'dark' ? darkAsset : lightAsset
```

#### UnoCSS Configuration
- Provides alternative utility CSS generation
- Used alongside Tailwind for flexibility

---

### 5. Utilities (`src/lib/utils.ts`)

**`cn(...inputs)`** - Class name combiner
- Merges Tailwind classes while handling conflicts
- Uses `clsx` + `tailwind-merge`

**`flyAndScale(node, params)`** - Custom transition
- 3D fly-in animation with scale effect
- Configurable: y offset, x offset, start scale, duration

**Duration Calculations**
- `computeExactDuration(from, to)` - Formats duration as "1 year and 3 months"
- `getMonthName(index)` - Month localization
- `getMonthAndYear(date)` - Formats as "January 2023"

**Routing**
- `href(url)` - Adds base path for GitHub Pages deployment

---

## Key Features & Interactions

### 1. Theme Toggle
- Uses `mode-watcher` library for system theme detection
- Manual toggle in NavBar
- Persists user preference
- All assets support light/dark variants

### 2. Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- NavBar adapts:
  - Desktop: Full navigation bar
  - Mobile: Hamburger menu in dialog
  
### 3. Search & Filter
- **Global Search**: Cross-category search in `/search`
- **Category-Specific Filters**: Projects can filter by skills
- Real-time updates using Svelte reactivity

### 4. Dynamic Content Loading
```typescript
// Dynamic routes use +page.ts load functions
export function load({ params }) {
  return { item: findBySlug(params.slug) }
}
```

### 5. Markdown Support
- Renders markdown with syntax highlighting
- GFM (GitHub Flavored Markdown) support
- Sanitization against XSS attacks
- Code highlighting with Prism.js (TypeScript theme)

### 6. Visual Effects
- **FancyCard 3D Tilt**: On hover, card tilts based on mouse position
- **Glow Effect**: Radial gradient follows cursor
- **Auto-Rotating Carousel**: Home page skill showcase
- **Smooth Transitions**: Fly + scale animation

---

## Data Flow

### Content Pipeline

```
Data Sources (TypeScript)
        ↓
src/lib/data/*.ts (Types & Arrays)
        ↓
Svelte Components (reactive)
        ↓
+page.svelte (rendering)
        ↓
HTML Output
```

### Search Example

```
User Types in Search
    ↓
$search reactive variable updates
    ↓
getResult(query) derives matching items
    ↓
Results grouped by category
    ↓
Components re-render with $derived
```

### Theme Example

```
mode-watcher detects system preference
    ↓
mode store updates ($mode = 'light' | 'dark')
    ↓
Conditional rendering: $mode === 'dark' ? darkAsset : lightAsset
    ↓
All components reactively show correct theme
```

---

## Build & Deployment

### Development
```bash
npm run dev      # Start dev server with HMR
npm run check    # Type checking
npm run check:watch
npm run lint     # Format & lint
npm run format   # Auto-format
```

### Production Build
```bash
npm run build    # Static site generation
npm run preview  # Preview built site
```

### Output
- Static HTML/CSS/JS (no server required)
- Suitable for GitHub Pages, Vercel, Netlify
- Base path configurable via `svelte.config.js`

---

## Component Dependency Graph

```
Root Layout (+layout.svelte)
├── ModeWatcher (theme detection)
└── NavBar
    ├── Dialog (mobile menu)
    ├── Button
    ├── Icon
    ├── Tooltip
    └── Toggle (theme)

Home Page (+page.svelte)
├── Title
├── Carousel
│   ├── CarouselContent
│   ├── CarouselItem
│   ├── CarouselNext
│   └── CarouselPrevious
├── Button
├── Icon
├── Tooltip
└── ResponsiveContainer

Skills List (+page.svelte)
├── SearchPage
├── FancyCard (per skill)
├── CardContent
├── CardTitle
├── Separator
└── Muted (typography)

Skills Detail ([slug]/+page.svelte)
├── BasePage
├── FancyBanner
├── Markdown
├── Badge (related items)
└── Separator

Projects List (+page.svelte)
├── SearchPage
├── Toggle (skill filters)
├── ProjectCard (per project)
└── EmptyResult

Projects Detail ([slug]/+page.svelte)
├── BasePage
├── FancyBanner
├── Screenshot carousel
├── Badge (links & skills)
└── Duration display

Search (+page.svelte)
├── SearchPage
├── FancyCard (per result)
├── Avatar
├── Tooltip
└── Separator (category dividers)
```

---

## Key Design Patterns

### 1. Svelte 5 Reactivity
- `$state()` for mutable state
- `$derived()` for computed values
- `$props()` for component props
- `$effect()` for side effects

### 2. Reusable Data Functions
```typescript
// Helper function for filtering
getSkills(...slugs: string[]) 
groupByCategory(query: string)
```

### 3. Type-Safe Slugs
```typescript
// Uses string literal types for auto-complete
type Icon = `i-carbon-${string}`
```

### 4. Asset Abstraction
```typescript
// Assets support light/dark variants
const asset = (lightFilename, darkFilename = lightFilename)
// Rendered with: $mode === 'dark' ? asset.dark : asset.light
```

### 5. Markdown-in-Data
```typescript
// Can import .md files as raw strings
import svelteMd from './md/svelte.md?raw'
```

---

## Performance Considerations

1. **Static Site Generation** - Pre-renders at build time
2. **No SSR** - `export const ssr = false` (client-side only)
3. **Code Splitting** - SvelteKit handles component bundling
4. **Asset Optimization**:
   - Logo images (SVG/PNG)
   - Favicon in static folder
5. **Lazy Loading** - Carousel items load as needed

---

## Customization Guide

To customize this portfolio:

1. **Content**: Edit `src/lib/data/*.ts` files
2. **Colors**: Modify `src/app.css` CSS variables
3. **Assets**: Add logos to `static/logos/`, reference in `assets.ts`
4. **Components**: Create new in `src/lib/components/`
5. **Pages**: Add new routes in `src/routes/`
6. **Styling**: Update Tailwind in `tailwind.config.ts`

---

## Dependencies Summary

| Package | Purpose |
|---------|---------|
| @sveltejs/kit | Full-stack framework |
| svelte 5 | UI framework |
| typescript | Type safety |
| tailwindcss | Utility CSS |
| unocss | Alternative CSS |
| bits-ui | Headless components |
| marked + marked-gfm-heading-id | Markdown parsing |
| prismjs | Code highlighting |
| dompurify | HTML sanitization |
| embla-carousel-svelte | Carousel component |
| lucide-svelte | Icon library |
| mode-watcher | Theme detection |
| svelte-sonner | Toast notifications |
| @riadh-adrani/utils | Utility functions |

---

## Summary

This is a **modern, type-safe, responsive portfolio template** that demonstrates:
- Excellent component architecture (Svelte 5)
- Data-driven content management (TypeScript)
- Beautiful UI with effects (FancyCard 3D, carousels)
- Full-text search and filtering
- Theme support (light/dark)
- Markdown content support
- Production-ready (static export for hosting)

The codebase is clean, well-organized, and highly customizable!
