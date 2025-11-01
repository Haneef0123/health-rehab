# Test Plan Template

Use this template when creating comprehensive test plans for features.

---

## Test Overview

**Feature:** [Feature name]
**Test Type:** Unit / Integration / E2E / Performance / Security
**Priority:** P0 / P1 / P2 / P3
**Coverage Target:** > 90%

---

## Test Scope

### In Scope
- [ ] Component rendering
- [ ] User interactions
- [ ] State management
- [ ] Data persistence
- [ ] API integration
- [ ] Error handling
- [ ] Edge cases

### Out of Scope
- [ ] [What won't be tested and why]

---

## Unit Tests

### Component Tests

#### Component: `ComponentName`

**File:** `src/components/path/__tests__/ComponentName.test.tsx`

**Test Cases:**

1. **Renders correctly**
   ```typescript
   it('should render with default props', () => {
     // Test implementation
   });
   ```

2. **Handles user interactions**
   ```typescript
   it('should handle button click', async () => {
     // Test implementation
   });
   ```

3. **Shows loading state**
   ```typescript
   it('should display loading spinner when loading', () => {
     // Test implementation
   });
   ```

4. **Shows error state**
   ```typescript
   it('should display error message on error', () => {
     // Test implementation
   });
   ```

5. **Accessibility**
   ```typescript
   it('should be keyboard navigable', () => {
     // Test implementation
   });
   ```

### Store Tests

#### Store: `storeName`

**File:** `src/stores/__tests__/storeName.test.ts`

**Test Cases:**

1. **Initial state**
   ```typescript
   it('should have correct initial state', () => {
     // Test implementation
   });
   ```

2. **Actions update state**
   ```typescript
   it('should update state when action is called', () => {
     // Test implementation
   });
   ```

3. **Persistence**
   ```typescript
   it('should persist to IndexedDB', async () => {
     // Test implementation
   });
   ```

4. **Hydration**
   ```typescript
   it('should hydrate from IndexedDB on init', async () => {
     // Test implementation
   });
   ```

### Utility Tests

#### Utility: `utilityName`

**File:** `src/lib/__tests__/utilityName.test.ts`

**Test Cases:**

1. **Normal input**
   ```typescript
   it('should process valid input correctly', () => {
     // Test implementation
   });
   ```

2. **Edge cases**
   ```typescript
   it('should handle edge case: empty input', () => {
     // Test implementation
   });
   ```

3. **Error cases**
   ```typescript
   it('should throw error for invalid input', () => {
     // Test implementation
   });
   ```

---

## Integration Tests

### Feature Flow: `featureName`

**File:** `src/app/__tests__/featureName.test.tsx`

**Test Cases:**

1. **Complete user flow**
   ```typescript
   it('should complete feature workflow end-to-end', async () => {
     // 1. Render page
     // 2. Fill form
     // 3. Submit
     // 4. Verify data persisted
     // 5. Verify UI updated
   });
   ```

2. **Error recovery**
   ```typescript
   it('should recover from errors gracefully', async () => {
     // Test implementation
   });
   ```

3. **Concurrent operations**
   ```typescript
   it('should handle concurrent updates', async () => {
     // Test implementation
   });
   ```

---

## E2E Tests (Playwright)

### User Journey: `journeyName`

**File:** `e2e/journeyName.spec.ts`

**Test Cases:**

1. **Happy path**
   ```typescript
   test('user can complete journey successfully', async ({ page }) => {
     // 1. Navigate to page
     // 2. Interact with elements
     // 3. Verify outcomes
     // 4. Check persistence
   });
   ```

2. **Validation errors**
   ```typescript
   test('user sees validation errors for invalid input', async ({ page }) => {
     // Test implementation
   });
   ```

3. **Offline behavior**
   ```typescript
   test('feature works offline', async ({ page, context }) => {
     // 1. Load page online
     // 2. Go offline
     // 3. Use feature
     // 4. Verify data queued
     // 5. Go online
     // 6. Verify sync
   });
   ```

4. **Cross-browser**
   ```typescript
   test('works in all browsers', async ({ page, browserName }) => {
     // Test in Chrome, Firefox, Safari
   });
   ```

5. **Responsive design**
   ```typescript
   test('works on mobile, tablet, desktop', async ({ page }) => {
     // Test different viewport sizes
   });
   ```

---

## Medical Safety Tests

### Safety Validation: `featureName`

**Critical for health/exercise features**

**Test Cases:**

1. **Contraindication checks**
   ```typescript
   it('should prevent contraindicated exercises', () => {
     // Test that unsafe exercises are blocked
   });
   ```

2. **Safety disclaimers**
   ```typescript
   it('should display safety disclaimer', () => {
     // Verify disclaimer is visible
   });
   ```

3. **Medical data validation**
   ```typescript
   it('should validate medical data before storing', () => {
     // Test Zod schema validation
   });
   ```

4. **Emergency stop**
   ```typescript
   it('should allow user to stop activity immediately', () => {
     // Test emergency stop mechanism
   });
   ```

---

## Performance Tests

### Load Time

```typescript
it('should load in < 1.5 seconds', async () => {
  const startTime = performance.now();
  // Render component/page
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(1500);
});
```

### Interaction Speed

```typescript
it('should respond to interactions in < 100ms', async () => {
  // Click button
  const startTime = performance.now();
  // Measure update time
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100);
});
```

### Bundle Size

```bash
# Run build and check bundle size
pnpm build
# Check .next/static/chunks size
# Should be < 200KB gzipped
```

---

## Accessibility Tests

### WCAG 2.1 AA Compliance

```typescript
it('should meet WCAG 2.1 AA standards', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation

```typescript
it('should be fully keyboard navigable', async () => {
  render(<Component />);
  // Tab through elements
  // Verify focus order
  // Test Enter/Space activation
  // Test Escape to close
});
```

### Screen Reader

```typescript
it('should have proper ARIA labels', () => {
  render(<Component />);
  expect(screen.getByLabelText('Input label')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
});
```

---

## Test Data

### Mock Data

```typescript
// src/test/mockData.ts
export const mockPainLog = {
  id: '1',
  intensity: 6,
  location: 'lower-back',
  timestamp: new Date('2025-11-01T10:00:00Z'),
};

export const mockExercise = {
  id: 'ex-1',
  name: 'Cat-Cow Stretch',
  category: 'mobility',
  targetMuscles: ['spine', 'core'],
  contraindications: ['acute-disc-injury'],
};
```

### Test Utilities

```typescript
// src/test/utils.tsx
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllTheProviders });
}

export function createMockStore(initialState = {}) {
  return create(() => ({ ...defaultState, ...initialState }));
}
```

---

## Test Environment Setup

### Vitest Config

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
```

### Global Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock IndexedDB
global.indexedDB = /* mock implementation */;
```

---

## Coverage Requirements

### Minimum Coverage Thresholds

- **Statements:** 90%
- **Branches:** 90%
- **Functions:** 90%
- **Lines:** 90%

### Files Requiring 100% Coverage

- Medical safety logic
- Data validation schemas
- Critical user flows (pain tracking, exercise logging)

---

## Test Execution

### Local Development

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### CI/CD

```bash
# Run all tests
pnpm test:coverage && pnpm test:e2e

# Generate coverage report
pnpm test:coverage --reporter=json --reporter=html
```

---

## Success Criteria

- [ ] All tests pass
- [ ] Coverage > 90% for all files
- [ ] No flaky tests (must be deterministic)
- [ ] Fast execution (< 30s for unit tests)
- [ ] E2E tests cover critical paths
- [ ] Medical safety tests validate constraints
- [ ] Accessibility tests pass (axe-core)
- [ ] Performance tests meet budgets

---

## Continuous Improvement

### After Each Test Run

1. Review failed tests
2. Update test cases for new edge cases discovered
3. Refactor brittle tests
4. Document test patterns
5. Share learnings with team

---

## References

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright Documentation](https://playwright.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
