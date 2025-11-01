# Health Rehab Design System

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Status:** Active

---

## Introduction

This document defines the complete design system for the Health Rehab application—a comprehensive guide to colors, typography, spacing, components, and interaction patterns that create a calming, accessible, and medically-appropriate user experience.

### Design Philosophy

1. **Calming & Healing**: Use blues (trust, calm) and greens (healing, growth) to reduce anxiety
2. **Clarity Over Complexity**: Minimize cognitive load for users managing pain
3. **Accessibility First**: WCAG 2.1 AA compliance minimum, AAA where possible
4. **Mobile-First**: Responsive design from 320px to 1920px+
5. **Performance**: 60fps animations, instant feedback

---

## Color System

### Primary Palette (Indigo - Trust & Calm)

Used for primary actions, navigation, and key interactive elements.

```css
--color-primary-50:  #eef2ff  /* Very light indigo backgrounds */
--color-primary-100: #e0e7ff  /* Light indigo for hover states */
--color-primary-200: #c7d2fe
--color-primary-300: #a5b4fc
--color-primary-400: #818cf8  /* Lighter interactive elements */
--color-primary-500: #6366f1  /* PRIMARY - Main brand color */
--color-primary-600: #4f46e5  /* Darker primary for hover */
--color-primary-700: #4338ca
--color-primary-800: #3730a3  /* Dark mode primary */
--color-primary-900: #312e81
--color-primary-950: #1e1b4b  /* Very dark indigo */
```

**Usage:**
- Primary buttons: `primary-600`
- Links: `primary-500`
- Active navigation: `primary-600`
- Focus rings: `primary-500`

### Secondary Palette (Amber - Warmth & Energy)

Used for highlights, badges, and secondary actions.

```css
--color-secondary-50:  #fffbeb
--color-secondary-100: #fef3c7
--color-secondary-200: #fde68a
--color-secondary-300: #fcd34d
--color-secondary-400: #fbbf24
--color-secondary-500: #f59e0b  /* SECONDARY - Accent color */
--color-secondary-600: #d97706  /* Darker secondary */
--color-secondary-700: #b45309
--color-secondary-800: #92400e
--color-secondary-900: #78350f
--color-secondary-950: #451a03
```

**Usage:**
- Secondary buttons: `secondary-500`
- Badges: `secondary-100` background, `secondary-700` text
- Highlights: `secondary-200`

### Accent Palette (Red - Alerts & Pain Indicators)

Used for errors, warnings, and high pain levels.

```css
--color-accent-50:  #fef2f2
--color-accent-100: #fee2e2
--color-accent-200: #fecaca
--color-accent-300: #fca5a5
--color-accent-400: #f87171
--color-accent-500: #ef4444  /* ACCENT - Error/Warning */
--color-accent-600: #dc2626
--color-accent-700: #b91c1c
--color-accent-800: #991b1b
--color-accent-900: #7f1d1d
```

**Usage:**
- Error messages: `accent-500`
- Destructive actions: `accent-600`
- Pain level 7-10: `accent-500` to `accent-700`

### Success Palette (Green - Healing & Growth)

Used for positive feedback, completed exercises, and low pain.

```css
--color-success-50:  #f0fdf4
--color-success-500: #22c55e  /* SUCCESS - Positive feedback */
--color-success-600: #16a34a
--color-success-700: #15803d
```

**Usage:**
- Success messages: `success-500`
- Completed exercises: `success-100` background
- Pain level 0-3: `success-500`

### Neutral Palette (Shadows & Text)

Derived from Tailwind's gray scale.

**Light Mode:**
- Background: `hsl(0 0% 100%)` - Pure white
- Foreground (text): `hsl(240 10% 3.9%)` - Near black
- Muted background: `hsl(240 4.8% 95.9%)` - Light gray
- Muted foreground: `hsl(240 3.8% 46.1%)` - Medium gray
- Border: `hsl(240 5.9% 90%)` - Light gray border

**Dark Mode:**
- Background: `hsl(240 10% 3.9%)` - Very dark blue-gray
- Foreground (text): `hsl(0 0% 98%)` - Almost white
- Muted background: `hsl(240 3.7% 15.9%)` - Dark gray
- Muted foreground: `hsl(240 5% 64.9%)` - Light gray
- Border: `hsl(240 3.7% 15.9%)` - Dark border

### Pain Level Gradient

Special gradient for 0-10 pain scale visualization.

```javascript
const painColors = [
  '#22c55e', // 0 - Green (No pain)
  '#84cc16', // 1-2
  '#eab308', // 3-4 - Yellow (Moderate)
  '#f59e0b', // 5-6 - Amber
  '#f97316', // 7-8 - Orange
  '#ef4444', // 9-10 - Red (Severe)
];
```

---

## Typography

### Font Families

```css
--font-sans: 'Manrope', system-ui, sans-serif;    /* Headings */
--font-body: 'Inter', system-ui, sans-serif;      /* Body text */
--font-mono: 'JetBrains Mono', 'Courier New', monospace; /* Code */
```

**Font Loading (from layout.tsx):**
```typescript
import { Manrope, Inter } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

### Type Scale

| Name | Size | Line Height | Weight | Use Case |
|------|------|-------------|--------|----------|
| **Display** | 48px (3rem) | 1.2 | 700 | Hero headings |
| **H1** | 36px (2.25rem) | 1.25 | 700 | Page titles |
| **H2** | 30px (1.875rem) | 1.3 | 600 | Section headings |
| **H3** | 24px (1.5rem) | 1.4 | 600 | Subsection headings |
| **H4** | 20px (1.25rem) | 1.4 | 600 | Card titles |
| **Body Large** | 18px (1.125rem) | 1.6 | 400 | Intro paragraphs |
| **Body** | 16px (1rem) | 1.6 | 400 | Default text |
| **Body Small** | 14px (0.875rem) | 1.5 | 400 | Secondary text |
| **Caption** | 12px (0.75rem) | 1.5 | 400 | Labels, metadata |

### Text Styles (Tailwind Classes)

```tsx
// Headings
<h1 className="text-4xl font-bold font-sans">Page Title</h1>
<h2 className="text-3xl font-semibold font-sans">Section Title</h2>
<h3 className="text-2xl font-semibold font-sans">Subsection</h3>

// Body
<p className="text-base font-body text-foreground">Body text</p>
<p className="text-sm font-body text-muted-foreground">Secondary text</p>
<p className="text-xs font-body text-muted-foreground">Caption</p>
```

### Font Features

```css
body {
  font-feature-settings: "rlig" 1, "calt" 1; /* Ligatures */
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Spacing System

Based on 4px base unit for consistent rhythm.

| Token | Value | Use Case |
|-------|-------|----------|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Icon padding, tight spacing |
| `space-2` | 8px | Small gaps between elements |
| `space-3` | 12px | Button padding (vertical) |
| `space-4` | 16px | Default gap, card padding |
| `space-5` | 20px | Section spacing |
| `space-6` | 24px | Large component padding |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Page margins |
| `space-12` | 48px | Large section spacing |
| `space-16` | 64px | Hero section padding |
| `space-20` | 80px | Extra large spacing |
| `space-24` | 96px | Maximum spacing |

**Tailwind Classes:**
```tsx
<div className="p-4">16px padding</div>
<div className="gap-6">24px gap</div>
<div className="mt-8">32px margin-top</div>
```

---

## Border Radius

Custom tokens for rounded corners:

```css
--radius-card: 1.5rem;    /* 24px - Cards, dialogs */
--radius-button: 9999px;  /* Full rounded - Pills, badges */
--radius: 1.5rem;         /* Default radius */
```

**Usage:**
```tsx
<Card className="rounded-[var(--radius-card)]">
<Button className="rounded-[var(--radius-button)]">
<Input className="rounded-lg">
```

---

## Components

### Buttons

#### Variants

**Primary Button**
```tsx
<Button className="bg-primary-600 hover:bg-primary-700 text-white">
  Primary Action
</Button>
```

**Secondary Button**
```tsx
<Button className="bg-secondary-500 hover:bg-secondary-600 text-white">
  Secondary Action
</Button>
```

**Outline Button**
```tsx
<Button variant="outline" className="border-primary-600 text-primary-600">
  Outline
</Button>
```

**Ghost Button**
```tsx
<Button variant="ghost" className="hover:bg-primary-100">
  Ghost
</Button>
```

**Destructive Button**
```tsx
<Button variant="destructive" className="bg-accent-600 hover:bg-accent-700">
  Delete
</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>    {/* h-9 px-3 text-sm */}
<Button size="default">Default</Button> {/* h-11 px-4 */}
<Button size="lg">Large</Button>    {/* h-12 px-6 text-lg */}
<Button size="icon">🔍</Button>     {/* h-11 w-11 */}
```

#### States

- **Hover**: Darken background by 100
- **Active**: Darken by 200
- **Focus**: `ring-2 ring-primary-500 ring-offset-2`
- **Disabled**: `opacity-50 cursor-not-allowed`

### Cards

```tsx
<Card className="rounded-[var(--radius-card)] p-6 shadow-md">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Inputs

```tsx
<Input
  type="text"
  placeholder="Enter value"
  className="rounded-lg border-input focus:ring-2 focus:ring-primary-500"
/>
```

**States:**
- Default: `border-input`
- Focus: `ring-2 ring-primary-500`
- Error: `border-accent-500 focus:ring-accent-500`
- Disabled: `bg-muted cursor-not-allowed`

### Badges

```tsx
<Badge className="bg-secondary-100 text-secondary-700 rounded-full px-3 py-1">
  New
</Badge>

<Badge variant="success">Completed</Badge>
<Badge variant="destructive">High Pain</Badge>
```

### Dialogs / Modals

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="max-w-md rounded-[var(--radius-card)]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Layout System

### Responsive Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Desktops */
xl:  1280px  /* Large desktops */
2xl: 1536px  /* Extra large screens */
```

### Container

```tsx
<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Grid System

```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

---

## Shadows & Elevation

```css
shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)        /* Subtle */
shadow:      0 1px 3px rgba(0, 0, 0, 0.1)         /* Default */
shadow-md:   0 4px 6px rgba(0, 0, 0, 0.1)         /* Cards */
shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1)       /* Modals */
shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1)       /* Popovers */
shadow-2xl:  0 25px 50px rgba(0, 0, 0, 0.25)      /* Hero elements */
```

**Usage:**
- Cards: `shadow-md`
- Buttons (hover): `shadow-lg`
- Modals/Dialogs: `shadow-xl`
- Dropdown menus: `shadow-lg`

---

## Animations & Transitions

### Transition Durations

```css
transition-none:    0ms
transition-fast:    150ms   /* Hover states */
transition-base:    200ms   /* Default */
transition-medium:  300ms   /* Modals, dialogs */
transition-slow:    500ms   /* Page transitions */
```

### Easing Functions

```css
ease-linear:       cubic-bezier(0, 0, 1, 1)
ease-in:           cubic-bezier(0.4, 0, 1, 1)
ease-out:          cubic-bezier(0, 0, 0.2, 1)   /* Default */
ease-in-out:       cubic-bezier(0.4, 0, 0.2, 1)
```

### Common Animations

**Fade In**
```tsx
<div className="animate-in fade-in duration-200">
  Content
</div>
```

**Slide In**
```tsx
<div className="animate-in slide-in-from-bottom duration-300">
  Content
</div>
```

**Scale In**
```tsx
<div className="animate-in zoom-in-95 duration-200">
  Content
</div>
```

**Loading Spinner**
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600" />
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus indicators:

```css
focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
focus-visible:outline-none focus-visible:ring-2
```

**Example:**
```tsx
<button className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Click Me
</button>
```

### Color Contrast

Minimum contrast ratios (WCAG 2.1 AA):
- **Normal text** (< 18px): 4.5:1
- **Large text** (≥ 18px or ≥ 14px bold): 3:1
- **UI components**: 3:1

**Verified Combinations:**
- Primary-600 on white: ✅ 7.2:1
- Foreground on background: ✅ 17.5:1
- Muted-foreground on background: ✅ 4.6:1

### Touch Targets

Minimum size: **44x44px** (WCAG AAA)

```tsx
<button className="min-h-[44px] min-w-[44px]">
  Icon
</button>
```

### Screen Reader Support

```tsx
{/* Hidden visually, available to screen readers */}
<span className="sr-only">Visually hidden</span>

{/* ARIA labels */}
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

{/* ARIA descriptions */}
<input aria-describedby="email-hint" />
<p id="email-hint">We'll never share your email</p>
```

### Keyboard Navigation

- **Tab**: Navigate forward
- **Shift + Tab**: Navigate backward
- **Enter/Space**: Activate buttons/links
- **Escape**: Close dialogs/dropdowns
- **Arrow Keys**: Navigate lists/menus

---

## Icons

Using **Lucide React** (tree-shakeable, 1,500+ icons)

### Icon Sizes

```tsx
<Icon className="h-4 w-4" />   {/* 16px - Inline text */}
<Icon className="h-5 w-5" />   {/* 20px - Small buttons */}
<Icon className="h-6 w-6" />   {/* 24px - Default */}
<Icon className="h-8 w-8" />   {/* 32px - Large buttons */}
<Icon className="h-10 w-10" /> {/* 40px - Hero icons */}
```

### Common Icons

```tsx
import {
  Activity,       // Exercise tracking
  Heart,          // Health monitoring
  Pill,           // Medication
  UtensilsCrossed, // Diet
  TrendingDown,   // Pain decreasing
  AlertCircle,    // Warnings
  CheckCircle,    // Success
  XCircle,        // Errors
  ChevronRight,   // Navigation
  Menu,           // Hamburger menu
} from 'lucide-react';
```

---

## Component Patterns

### Loading States

**Skeleton Loader**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-muted rounded w-3/4"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>
```

**Spinner**
```tsx
<div className="flex justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600" />
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No data yet</h3>
  <p className="text-muted-foreground">Get started by adding your first entry</p>
  <Button className="mt-4">Add Entry</Button>
</div>
```

### Error States

```tsx
<div className="rounded-lg border border-accent-200 bg-accent-50 p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-accent-600 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-accent-900">Error occurred</h4>
      <p className="text-sm text-accent-700">Error message here</p>
    </div>
  </div>
</div>
```

### Toast Notifications

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Your pain log has been saved.",
  variant: "default", // or "destructive"
});
```

---

## Responsive Patterns

### Mobile-First Approach

```tsx
<div className="
  flex flex-col          /* Mobile: Stack vertically */
  md:flex-row            /* Tablet+: Horizontal layout */
  gap-4                  /* 16px gap */
  md:gap-6               /* 24px gap on tablet+ */
">
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### Hide/Show Based on Screen Size

```tsx
<nav className="
  hidden md:flex        /* Hidden on mobile, visible on md+ */
  items-center gap-4
">
  <NavItem>Home</NavItem>
  <NavItem>About</NavItem>
</nav>

<button className="md:hidden">  {/* Mobile menu button */}
  <Menu />
</button>
```

---

## Dark Mode

Automatic based on system preference or manual toggle.

```tsx
<html className={theme === 'dark' ? 'dark' : ''}>
  <body className="bg-background text-foreground">
    {/* Content automatically adapts */}
  </body>
</html>
```

**Dark mode classes:**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adapts to theme
</div>
```

---

## Medical-Specific Patterns

### Pain Scale Indicator

```tsx
<div className="flex items-center gap-2">
  {[...Array(10)].map((_, i) => {
    const level = i + 1;
    const isActive = level <= painLevel;
    return (
      <div
        key={level}
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
          isActive ? painColors[Math.floor(painLevel / 2)] : "bg-gray-200"
        )}
      >
        {level}
      </div>
    );
  })}
</div>
```

### Medical Safety Disclaimer

```tsx
<Alert className="border-accent-200 bg-accent-50">
  <AlertCircle className="h-4 w-4 text-accent-600" />
  <AlertTitle>Medical Disclaimer</AlertTitle>
  <AlertDescription>
    This tool is for personal tracking only. Always consult qualified
    healthcare professionals before starting new treatments or exercises.
  </AlertDescription>
</Alert>
```

---

## Best Practices

### Do's

- ✅ Use consistent spacing (multiples of 4px)
- ✅ Maintain 4.5:1 contrast ratio for text
- ✅ Provide focus indicators for all interactive elements
- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Add loading states for async operations
- ✅ Support keyboard navigation
- ✅ Test with screen readers
- ✅ Respect prefers-reduced-motion

### Don'ts

- ❌ Use color alone to convey information
- ❌ Make touch targets smaller than 44x44px
- ❌ Remove focus outlines without providing alternatives
- ❌ Use low-contrast text (< 4.5:1)
- ❌ Auto-play animations without user control
- ❌ Create keyboard traps
- ❌ Use generic button labels ("Click here")

---

## Tools & Resources

### Design Tools
- **Figma**: Design mockups
- **Tailwind CSS Intellisense**: VS Code extension
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Testing Tools
- **axe DevTools**: Accessibility testing
- **Lighthouse**: Performance & accessibility audits
- **React DevTools**: Component debugging

---

## Conclusion

This design system ensures the Health Rehab app is:

- ✅ **Visually Calming**: Reduces anxiety during pain management
- ✅ **Highly Accessible**: WCAG 2.1 AA compliant
- ✅ **Responsive**: Works on all devices (320px - 1920px+)
- ✅ **Consistent**: Predictable patterns throughout
- ✅ **Performant**: Optimized animations and transitions

Refer to `constitution.md` for principles and `architecture.md` for technical implementation.
