# UI/UX Validator

> Role: Ensure UI implementations meet design standards and provide excellent user experience

---

## Purpose
Validate frontend implementations against design mockups, accessibility standards, and UX best practices.

---

## Validation Checklist

### 1. Visual Design
- [ ] Matches design mockup (if provided)
- [ ] Consistent spacing (padding/margin)
- [ ] Typography hierarchy is clear
- [ ] Color palette matches brand guidelines
- [ ] Icons are consistent in size and style
- [ ] Images are optimized and responsive
- [ ] No layout shifts or janky animations

### 2. Responsive Design
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Works on large screens (1440px+)
- [ ] Touch targets minimum 44x44px
- [ ] Text is readable at all sizes
- [ ] No horizontal scrolling

### 3. Accessibility (WCAG 2.1 AA)
- [ ] Semantic HTML elements used
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] Screen reader tested
- [ ] No auto-playing media

### 4. User Experience
- [ ] Loading states shown
- [ ] Error states handled gracefully
- [ ] Success feedback provided
- [ ] Empty states designed
- [ ] Confirmation for destructive actions
- [ ] Disabled states are clear
- [ ] Clear call-to-action buttons

### 5. Performance
- [ ] Page loads under 3 seconds
- [ ] Images lazy-loaded
- [ ] No unnecessary re-renders
- [ ] Smooth animations (60fps)
- [ ] Bundle size optimized
- [ ] Lighthouse score >90

### 6. Interactions
- [ ] Hover states on interactive elements
- [ ] Active/pressed states
- [ ] Smooth transitions
- [ ] Logical tab order
- [ ] Form validation is helpful
- [ ] Tooltips where needed

---

## Design Comparison

### Automated Screenshot Testing
```javascript
// Example using Puppeteer
const compareWithDesign = async (url, mockupPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Take screenshots at different viewports
  const viewports = [
    { width: 375, height: 812, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await page.goto(url);
    await page.screenshot({
      path: `screenshots/actual-${viewport.name}.png`
    });
  }
  
  await browser.close();
  
  // Compare with mockups
  // Use image comparison library
};
```

---

## Common Issues to Flag

### Layout Issues
```css
/* ❌ Fixed heights cause overflow */
.container {
  height: 500px;
}

/* ✅ Use min-height for flexibility */
.container {
  min-height: 500px;
}
```

```css
/* ❌ Inconsistent spacing */
.button { margin: 8px; }
.card { padding: 12px; }
.input { margin: 15px; }

/* ✅ Use design system spacing scale */
.button { margin: var(--space-2); } /* 8px */
.card { padding: var(--space-4); }  /* 16px */
.input { margin: var(--space-4); }  /* 16px */
```

### Accessibility Issues
```html
<!-- ❌ Non-semantic markup -->
<div onclick="submit()">Submit</div>

<!-- ✅ Semantic button -->
<button type="submit">Submit</button>
```

```html
<!-- ❌ Missing alt text -->
<img src="product.jpg">

<!-- ✅ Descriptive alt text -->
<img src="product.jpg" alt="Blue wireless headphones with noise cancellation">
```

```jsx
// ❌ No keyboard support
<div onClick={handleClick}>Click me</div>

// ✅ Keyboard accessible
<button onClick={handleClick}>Click me</button>
```

### Responsive Issues
```css
/* ❌ Fixed pixel widths */
.container {
  width: 1200px;
}

/* ✅ Flexible width */
.container {
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
}
```

### Poor UX Patterns
```jsx
// ❌ No loading state
const Component = () => {
  const { data } = useQuery();
  return <div>{data.map(...)}</div>;
};

// ✅ Loading state shown
const Component = () => {
  const { data, loading } = useQuery();
  if (loading) return <Spinner />;
  return <div>{data.map(...)}</div>;
};
```

```jsx
// ❌ No error feedback
const handleSubmit = async () => {
  await api.post('/users', data);
};

// ✅ Error handling with user feedback
const handleSubmit = async () => {
  try {
    await api.post('/users', data);
    toast.success('User created successfully');
  } catch (error) {
    toast.error('Failed to create user. Please try again.');
  }
};
```

---

## Design Token Validation

### Typography
```typescript
// Validate font sizes match design system
const ALLOWED_FONT_SIZES = [
  '0.75rem',  // 12px - small text
  '0.875rem', // 14px - body text
  '1rem',     // 16px - base
  '1.25rem',  // 20px - h4
  '1.5rem',   // 24px - h3
  '2rem',     // 32px - h2
  '3rem',     // 48px - h1
];

// ❌ Flag: Using arbitrary font sizes
font-size: 18px;
font-size: 22px;

// ✅ Use design system values
font-size: var(--text-lg);
font-size: var(--text-xl);
```

### Spacing
```typescript
// Validate spacing uses scale
const SPACING_SCALE = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
};

// ❌ Arbitrary spacing
margin: 13px;
padding: 27px;

// ✅ Design system spacing
margin: var(--space-4);
padding: var(--space-8);
```

### Colors
```typescript
// Flag colors not in design system
const BRAND_COLORS = {
  primary: '#0066CC',
  secondary: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  // ... etc
};

// ❌ Random colors
color: #0055BB;
background: #AFAFAF;

// ✅ Design system colors
color: var(--color-primary);
background: var(--color-gray-500);
```

---

## Accessibility Testing

### Keyboard Navigation Test
```
Tab order should be:
1. Logo/home link
2. Primary navigation
3. Main content
4. Forms (in logical order)
5. Footer links

Test:
- Tab through entire page
- Shift+Tab to go backwards
- Enter/Space to activate buttons/links
- Arrow keys for radio buttons/menus
- Escape to close modals/dropdowns
```

### Screen Reader Test
```
Tools:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

Check:
- All content is announced
- Interactive elements have clear labels
- Form inputs have associated labels
- Errors are announced
- Dynamic content updates announced
```

### Color Contrast Test
```
Tools:
- Chrome DevTools (Lighthouse)
- axe DevTools
- WebAIM Contrast Checker

Requirements:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
```

---

## Performance Validation

### Core Web Vitals
```
Targets:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

### Image Optimization
```jsx
// ❌ Unoptimized images
<img src="/large-image.jpg" />

// ✅ Optimized with Next.js Image
<Image
  src="/large-image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

### Bundle Size
```bash
# Check bundle size
npm run build
npx webpack-bundle-analyzer

# Flag if:
- Initial bundle > 200KB (gzipped)
- Total JavaScript > 1MB
- Unused dependencies included
```

---

## Review Process

### Step 1: Visual Inspection
```
1. Open page in multiple browsers
2. Test at different viewport sizes
3. Compare with design mockup side-by-side
4. Check spacing with browser inspector
5. Verify typography matches
6. Test all interactive states
```

### Step 2: Automated Testing
```
1. Run Lighthouse audit
2. Run axe accessibility scan
3. Take screenshots at various viewports
4. Compare with baseline (if available)
5. Check bundle size
```

### Step 3: Manual Testing
```
1. Keyboard navigation test
2. Screen reader test
3. Touch interaction test (mobile)
4. Form submission test
5. Error state test
6. Loading state test
```

### Step 4: Provide Feedback
```
Categorize by severity:
🔴 Critical: Breaks functionality or major accessibility issue
🟡 Important: Deviates from design or UX issue
🟢 Minor: Small improvement opportunity
```

---

## Feedback Template

```markdown
## UI/UX Review: [Component/Page Name]

### Summary
[Brief overview of the implementation]

### Visual Design
✅ **What's Good:**
- [Positive point 1]
- [Positive point 2]

🔴 **Critical Issues:**
- [ ] [Issue with screenshot/reference]

🟡 **Improvements:**
- [ ] [Suggested improvement]

### Accessibility
- [ ] Keyboard navigation: [Pass/Fail - details]
- [ ] Screen reader: [Pass/Fail - details]
- [ ] Color contrast: [Pass/Fail - details]
- [ ] ARIA labels: [Pass/Fail - details]

### Responsive Design
- [ ] Mobile (375px): [Pass/Fail]
- [ ] Tablet (768px): [Pass/Fail]
- [ ] Desktop (1440px): [Pass/Fail]

### Performance
- Lighthouse Score: [Score]
- LCP: [Time]
- FID: [Time]
- CLS: [Score]
- Bundle Size: [Size]

### Screenshots
[Attach comparison screenshots if deviation from design]

### Next Steps
1. [Action item 1]
2. [Action item 2]
```

---

## Automation Instructions

### For Claude:
```
When validating UI/UX:

1. Inspect all component code
2. Check against design system/tokens
3. Use Puppeteer for screenshots if needed
4. Run automated accessibility tests
5. Check responsive breakpoints
6. Validate performance metrics
7. Provide specific, actionable feedback
8. Include code examples for fixes
9. Attach screenshots showing issues
10. Prioritize accessibility and UX issues

Always test:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Responsive behavior
- Loading/error states
- Touch targets on mobile
```

---

## Tools & Resources

### Testing Tools
- **Lighthouse:** Performance and accessibility
- **axe DevTools:** Accessibility scanning
- **Puppeteer/Playwright:** Screenshot testing
- **WebPageTest:** Performance testing
- **BrowserStack:** Cross-browser testing

### Design Resources
- **Figma:** Design files
- **Zeplin:** Design handoff
- **InVision:** Prototypes
- **Abstract:** Version control for designs

### Browser Extensions
- **Lighthouse**
- **axe DevTools**
- **WAVE**
- **React DevTools**
- **Vue DevTools**