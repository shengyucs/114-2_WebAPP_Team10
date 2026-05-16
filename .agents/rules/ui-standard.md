---
trigger: glob
glob: '**/*.{tsx,jsx,css}'
description: Visual language guide for the "Light-Blue Professional" theme and component styling.
---

# UI Design Standard: Light-Blue Professional

> Version: 1.0.0
> Last Updated: 2026-05-16

This document defines the visual language and component styling for the project. All generated UI must adhere to these aesthetics to ensure a cohesive "technical tool" feel.

## 1. Core Visual Language

- **Theme**: Light-Blue Professional / Blueprint Aesthetic.
- **Typography**: `Outfit`, sans-serif (Clean, modern, geometric).
- **Color Palette**:
  - Backgrounds: Primary `#ffffff`, Secondary `#f4f7fa` (Light blue-gray).
  - Borders: `#cbd5e1` (Slate 300) for standard, `#3b82f6` (Blue 500) for accents.
  - Text: Primary `#0f172a` (Deep slate), Secondary `#475569`.
  - Accents: `#2563eb` (Blue 600) for active elements.

## 2. Component Signatures

### 2.1 Panel & Frames (.panel-frame)

Every main UI block (Toolbox, Inspector, Timeline) must use the `.panel-frame` style:

- White background with a subtle 1px border.
- Soft drop shadows (`var(--shadow-soft)`).
- **Technical Brackets**: Must include `corner-ornament` at the four corners for a "technical instrument" look.

### 2.2 Sidebars

- **Fixed Width**: Default is `280px`.
- **Hover Interaction**: Sidebars should have an accent line on the inner edge that expands vertically on hover.
- **Headers**: All-caps, high letter-spacing (`tracking-[0.2em]`), and a technical "pulse" dot indicator.

### 2.3 Canvas (React Flow)

- **Background**: Dot grid pattern (`BackgroundVariant.Dots`).
- **Colors**: Use `var(--bg-secondary)` for the canvas base to differentiate from the white sidebars.

## 3. Implementation Example

### Standard Sidebar Structure

```tsx
const SidebarExample = () => (
  <aside className="w-[280px] h-full sidebar-frame-left panel-frame">
    {/* Corner Ornaments */}
    <div className="corner-ornament corner-tl" />
    <div className="corner-ornament corner-tr" />
    <div className="corner-ornament corner-bl" />
    <div className="corner-ornament corner-br" />

    {/* Header */}
    <div className="panel-header relative z-10">
      <h2 className="text-sm font-black tracking-[0.2em] uppercase">Toolbox</h2>
      <div className="w-2 h-2 bg-accent-color rounded-full animate-pulse" />
    </div>

    {/* Content */}
    <div className="p-6 relative z-10">{/* ... Content goes here ... */}</div>
  </aside>
);
```

## 4. Forbidden UI Patterns

- No generic bright colors (Red, Yellow) unless for critical errors.
- No rounded corners greater than `rounded-xl` (Keep it crisp).
- No floating cards without the defined `.panel-frame` structure.
- No dark mode (Currently strictly a light professional theme).
