# G-Network Design System Documentation

## 🎨 Overview

This is a comprehensive, production-ready CSS design system built for the G-Network application. It provides a complete set of design tokens, components, and utilities following modern web development best practices.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Layout System](#layout-system)
5. [Components](#components)
6. [Utilities](#utilities)
7. [Theme Customization](#theme-customization)
8. [Best Practices](#best-practices)

---

## 🚀 Getting Started

The design system is already integrated into `main.jsx`. All styles are available globally.

### Quick Example

```html
<div class="container">
  <div class="card">
    <div class="card-header">
      <h3>Welcome to G-Network</h3>
    </div>
    <div class="card-body">
      <p>This is a professional card component.</p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
```

---

## 🎨 Design Tokens

### Color Palette

#### Primary Colors (Purple/Violet)
- `--primary-500`: Main brand color
- `--primary-600`: Interactive elements
- `--primary-700`: Hover states

#### Secondary Colors (Teal/Cyan)
- `--secondary-500`: Accent color
- `--secondary-600`: Secondary actions

#### Semantic Colors
```css
--success: #10b981    /* Green */
--error: #ef4444      /* Red */
--warning: #f59e0b    /* Amber */
--info: #3b82f6       /* Blue */
```

### Spacing System (4px base)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

### Usage in Components

```html
<div style="padding: var(--space-4); margin-bottom: var(--space-6);">
  Content with consistent spacing
</div>
```

---

## 📝 Typography

### Font Families

```css
--font-sans: 'Inter', system-ui
--font-display: 'Poppins'
--font-mono: 'Fira Code', monospace
```

### Typography Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| `h1` | 48px | 800 | Page titles |
| `h2` | 36px | 700 | Section headers |
| `h3` | 30px | 700 | Subsections |
| `h4` | 24px | 600 | Card titles |
| `p` | 16px | 400 | Body text |
| `small` | 14px | 400 | Captions |

### Text Utilities

```html
<h1 class="text-gradient">Gradient Heading</h1>
<p class="text-center">Centered text</p>
```

---

## 📐 Layout System

### Container

```html
<div class="container">
  <!-- Max-width 1280px, auto-centered -->
</div>

<div class="container-fluid">
  <!-- Full-width with padding -->
</div>
```

### Grid System

```html
<!-- 3-column grid -->
<div class="grid grid-cols-3 gap-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- 1 col mobile, 2 tablet, 4 desktop -->
</div>
```

### Flexbox

```html
<div class="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

---

## 🧩 Components

### 1. Buttons

#### Variants

```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Secondary</button>

<!-- Outline Button -->
<button class="btn btn-outline">Outline</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Ghost</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>

<!-- Success Button -->
<button class="btn btn-success">Confirm</button>
```

#### Sizes

```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

#### States

```html
<button class="btn btn-primary" disabled>Disabled</button>
```

#### Button Group

```html
<div class="btn-group">
  <button class="btn btn-outline">Left</button>
  <button class="btn btn-outline">Center</button>
  <button class="btn btn-outline">Right</button>
</div>
```

---

### 2. Forms

#### Basic Form

```html
<form>
  <div class="form-group">
    <label class="form-label required">Email</label>
    <input type="email" class="form-input" placeholder="you@example.com">
    <div class="form-feedback valid">Looks good!</div>
  </div>

  <div class="form-group">
    <label class="form-label">Message</label>
    <textarea class="form-textarea" placeholder="Your message..."></textarea>
  </div>

  <div class="form-group">
    <label class="form-label">Country</label>
    <select class="form-select">
      <option>Select country</option>
      <option>United States</option>
      <option>Canada</option>
    </select>
  </div>

  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

#### Validation States

```html
<!-- Valid Input -->
<input type="text" class="form-input is-valid">
<div class="form-feedback valid">Perfect!</div>

<!-- Invalid Input -->
<input type="text" class="form-input is-invalid">
<div class="form-feedback invalid">This field is required</div>
```

#### Checkbox & Radio

```html
<div class="form-check">
  <input type="checkbox" class="form-check-input" id="check1">
  <label class="form-check-label" for="check1">Remember me</label>
</div>

<div class="form-check">
  <input type="radio" class="form-check-input" name="option" id="radio1">
  <label class="form-check-label" for="radio1">Option 1</label>
</div>
```

#### Toggle Switch

```html
<label class="form-switch">
  <input type="checkbox">
  <span class="form-switch-slider"></span>
</label>
```

---

### 3. Cards

```html
<!-- Basic Card -->
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Card Variants -->
<div class="card card-elevated">Elevated Card</div>
<div class="card card-glass">Glass Card (blur effect)</div>
<div class="card card-bordered">Bordered Card</div>
```

---

### 4. Navigation

```html
<nav class="navbar">
  <div class="navbar-brand">
    <i class="fas fa-network-wired"></i>
    G-Network
  </div>
  
  <ul class="navbar-nav">
    <li class="nav-item">
      <a href="#" class="nav-link active">Home</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">Feed</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">Profile</a>
    </li>
  </ul>
</nav>
```

---

### 5. Modals

```html
<div class="modal-overlay active">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="modal-body">
      <p>Modal content goes here.</p>
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-ghost">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

**JavaScript to toggle:**

```javascript
const modalOverlay = document.querySelector('.modal-overlay');
modalOverlay.classList.toggle('active');
```

---

### 6. Alerts

```html
<!-- Success Alert -->
<div class="alert alert-success">
  <i class="fas fa-check-circle alert-icon"></i>
  <div class="alert-content">
    <div class="alert-title">Success!</div>
    Operation completed successfully.
  </div>
</div>

<!-- Error Alert -->
<div class="alert alert-error">
  <i class="fas fa-exclamation-circle alert-icon"></i>
  <div class="alert-content">
    <div class="alert-title">Error</div>
    Something went wrong.
  </div>
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
  <i class="fas fa-exclamation-triangle alert-icon"></i>
  <div class="alert-content">
    Please review your information.
  </div>
</div>

<!-- Info Alert -->
<div class="alert alert-info">
  <i class="fas fa-info-circle alert-icon"></i>
  <div class="alert-content">
    New features available!
  </div>
</div>
```

---

### 7. Badges

```html
<span class="badge badge-primary">New</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-info">Info</span>

<!-- Dot Badge -->
<span class="badge badge-dot" style="background: var(--success);"></span>
```

---

### 8. Tooltips

```html
<div class="tooltip">
  Hover me
  <span class="tooltip-text">Tooltip content</span>
</div>
```

---

### 9. Loading Spinner

```html
<div class="spinner"></div>
<div class="spinner spinner-sm"></div>
<div class="spinner spinner-lg"></div>
```

---

## 🛠️ Utilities

### Spacing

```html
<!-- Margin -->
<div class="m-0">No margin</div>
<div class="mt-4">Margin top</div>
<div class="mb-4">Margin bottom</div>
<div class="mx-auto">Centered horizontally</div>

<!-- Padding -->
<div class="p-4">Padding all sides</div>
<div class="pt-4">Padding top</div>
<div class="pb-4">Padding bottom</div>
```

### Display

```html
<div class="d-none">Hidden</div>
<div class="d-block">Block</div>
<div class="d-flex">Flex</div>
<div class="d-grid">Grid</div>
```

### Width & Height

```html
<div class="w-full">Full width</div>
<div class="h-full">Full height</div>
```

### Border Radius

```html
<div class="rounded-sm">Small radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Fully rounded</div>
```

### Shadows

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Opacity

```html
<div class="opacity-50">50% opacity</div>
```

---

## 🌓 Theme Customization

### Dark Mode

The design system automatically supports dark mode based on system preferences.

**Manual Toggle:**

```javascript
document.body.classList.toggle('dark-mode');
```

### Custom Theme Colors

Override CSS variables in your own stylesheet:

```css
:root {
  --primary-600: #your-color;
  --secondary-500: #another-color;
}
```

---

## 🎯 Best Practices

### 1. **Use Design Tokens**
Always use CSS variables instead of hardcoded values:

```css
/* ❌ Don't */
color: #7c3aed;
margin: 16px;

/* ✅ Do */
color: var(--primary-600);
margin: var(--space-4);
```

### 2. **Component Composition**
Build complex UIs by combining components:

```html
<div class="card">
  <div class="card-body">
    <h3>User Profile</h3>
    <div class="flex gap-4">
      <button class="btn btn-primary">Edit</button>
      <button class="btn btn-outline">Share</button>
    </div>
  </div>
</div>
```

### 3. **Responsive Design**
Use responsive utilities:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- Stacks on mobile, 2 cols on tablet, 4 on desktop -->
</div>
```

### 4. **Accessibility**
- Always use semantic HTML
- Include focus states (already built-in)
- Use proper ARIA labels
- Ensure color contrast

```html
<button class="btn btn-primary" aria-label="Submit form">
  Submit
</button>
```

### 5. **Performance**
- The design system is optimized for performance
- Transitions automatically reduce for users with motion preferences
- Print styles included

---

## 📱 Responsive Breakpoints

| Breakpoint | Size | Prefix |
|------------|------|--------|
| Mobile | < 768px | (default) |
| Tablet | ≥ 768px | `md:` |
| Desktop | ≥ 1024px | `lg:` |
| Large Desktop | ≥ 1280px | `xl:` |

### Usage

```html
<div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Responsive columns -->
</div>
```

---

## 🔄 Animations

### Built-in Animations

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in-right">Slides from right</div>
<div class="animate-scale-in">Scales in</div>
<div class="animate-pulse">Pulsing effect</div>
```

### Transitions

```html
<div class="transition-all">Smooth transitions</div>
<div class="transition-colors">Color transitions</div>
<div class="transition-transform">Transform transitions</div>
```

---

## 📦 Quick Reference

### Common Patterns

#### Hero Section
```html
<section class="section-lg">
  <div class="container">
    <h1 class="text-gradient text-center">Welcome to G-Network</h1>
    <p class="text-center">Connect with developers worldwide</p>
    <div class="flex justify-center gap-4">
      <button class="btn btn-primary btn-lg">Get Started</button>
      <button class="btn btn-outline btn-lg">Learn More</button>
    </div>
  </div>
</section>
```

#### Feature Card Grid
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="card">
    <div class="card-body text-center">
      <i class="fas fa-rocket text-primary-600" style="font-size: 3rem;"></i>
      <h4>Fast</h4>
      <p>Lightning-fast performance</p>
    </div>
  </div>
  <!-- More cards -->
</div>
```

#### Form Card
```html
<div class="card" style="max-width: 500px; margin: 0 auto;">
  <div class="card-header">
    <h3>Sign In</h3>
  </div>
  <div class="card-body">
    <form>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" class="form-input">
      </div>
      <button type="submit" class="btn btn-primary w-full">
        Sign In
      </button>
    </form>
  </div>
</div>
```

---

## 🎨 Color Reference

### Using Colors

```html
<!-- Text Colors -->
<p style="color: var(--text-primary)">Primary text</p>
<p style="color: var(--text-secondary)">Secondary text</p>

<!-- Background Colors -->
<div style="background-color: var(--primary-600); color: white;">
  Primary background
</div>

<!-- Semantic Colors -->
<div style="background-color: var(--success-light); color: var(--success-dark);">
  Success message
</div>
```

---

## 🚀 Integration Examples

### React Component Example

```jsx
import React from 'react';

function ProfileCard({ user }) {
  return (
    <div className="card card-elevated">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="rounded-full"
            style={{ width: '64px', height: '64px' }}
          />
          <div>
            <h4 className="m-0">{user.name}</h4>
            <p className="text-secondary">{user.role}</p>
          </div>
        </div>
        <div className="flex gap-3" style={{ marginTop: 'var(--space-4)' }}>
          <button className="btn btn-primary btn-sm">Follow</button>
          <button className="btn btn-ghost btn-sm">Message</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📞 Support

For questions or issues with the design system:
1. Check this documentation
2. Review the CSS file for implementation details
3. Test in multiple browsers (Chrome, Firefox, Edge)

---

**Design System Version:** 2.0  
**Last Updated:** December 2025  
**Maintained by:** G-Network Development Team
