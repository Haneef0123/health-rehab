# Health Rehab Project Constitution

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Status:** Active

---

## Introduction

This document establishes the foundational principles, standards, and rules governing the Health Rehab project—a single-user spine health and rehabilitation tracking dashboard for Haneef. Every design decision, code contribution, and feature must align with these non-negotiable principles.

---

## 🎯 Core Mission

Build a **privacy-focused, medically-safe, and performant** rehabilitation assistant that helps Haneef manage cervical lordosis loss, thoracic kyphosis, and L4/L5-S1 disc bulge through evidence-based tracking, adaptive exercise guidance, and data-driven insights.

---

## 7 Core Non-Negotiable Principles

### 1. User-Centric Safety First 🛡️

**Medical safety is paramount and non-negotiable.**

#### Safety Requirements

- **Always-Visible Disclaimers**: Every health-related page must display: "This tool is for personal tracking. Always consult qualified healthcare professionals before starting new treatments, exercises, or dietary changes."

- **Contraindication Enforcement**:
  - **Cervical Lordosis Loss**: No exercises involving neck compression, heavy overhead pressing, or prolonged looking down
  - **Thoracic Kyphosis**: No exercises that worsen forward shoulder rounding; prioritize thoracic extension and scapular retraction
  - **L4/L5-S1 Disc Bulge**: Absolutely no:
    - Heavy deadlifts or loaded spine flexion
    - Crunches, sit-ups, or twisting under load
    - Long unsupported sitting (> 30 min without movement)
    - High-impact activities (running, jumping)

- **Exercise Library Vetting**: All exercises must be:
  - Spine-friendly and rehabilitation-focused
  - Documented with proper form instructions
  - Tagged with contraindications
  - Validated against user's medical profile

- **Clinician-Ready Exports**: Pain logs, exercise history, and medication tracking must be exportable in formats suitable for sharing with doctors/physiotherapists.

#### Code Requirements

```typescript
// Example: Contraindication check before adding exercise
function canPerformExercise(exercise: Exercise, userProfile: UserProfile): boolean {
  const { medicalConditions } = userProfile;

  if (medicalConditions.includes('l4-l5-disc-bulge')) {
    if (exercise.contraindications.includes('spine-compression')) {
      return false; // Block unsafe exercise
    }
  }

  return true;
}
```

**Enforcement**: All PRs touching health/exercise logic must pass `/safety` checklist.

---

### 2. Performance & Zero Lag ⚡

**The app must be blazingly fast and feel instant.**

#### Performance Budgets

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.0s | 1.5s |
| Largest Contentful Paint (LCP) | < 1.5s | 2.0s |
| Time to Interactive (TTI) | < 2.0s | 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.15 |
| First Input Delay (FID) / INP | < 50ms | 100ms |
| UI Interaction Response | < 100ms | 150ms |
| Bundle Size (gzipped) | < 150KB | 200KB |
| Lighthouse Performance | > 95 | > 90 |

#### Implementation Standards

- **Incremental Rendering**: Use React.lazy(), Suspense, and dynamic imports
- **Optimistic UI**: Update UI immediately; sync with IndexedDB asynchronously
- **Code Splitting**: Route-based and component-based splitting
- **Asset Optimization**:
  - Images: WebP format, responsive sizes, lazy loading
  - Fonts: Subset fonts, preload critical fonts
  - Icons: Use Lucide React (tree-shakeable)
- **Caching**: Service Worker for offline-first, aggressive IndexedDB caching
- **No Blocking Operations**: All heavy computations in Web Workers

```typescript
// Example: Optimistic UI update
function logPain(entry: PainLog) {
  // Update UI immediately
  usePainStore.getState().addPainLog(entry);

  // Persist asynchronously
  db.painLogs.add(entry).catch(rollbackUpdate);
}
```

**Enforcement**: CI/CD must enforce performance budgets via Lighthouse CI.

---

### 3. Modular Architecture 🏗️

**Code must be maintainable, testable, and scalable.**

#### Directory Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (dashboard)/        # Authenticated routes
│   └── api/                # API endpoints (future)
├── components/
│   ├── ui/                 # Shadcn/Radix primitives
│   ├── layout/             # Layout components
│   ├── pain/               # Domain: Pain tracking
│   ├── exercise/           # Domain: Exercise library
│   ├── medication/         # Domain: Medication tracking
│   └── diet/               # Domain: Diet & nutrition
├── stores/                 # Zustand state management
│   ├── pain-store-v2.ts
│   ├── exercise-store-v2.ts
│   ├── medication-store.ts
│   └── diet-store.ts
├── lib/                    # Utilities & services
│   ├── db.ts               # IndexedDB manager
│   ├── constants.ts        # App-wide constants
│   ├── validation.ts       # Zod schemas
│   └── analytics.ts        # Analytics calculations
├── types/                  # TypeScript domain models
│   ├── pain.ts
│   ├── exercise.ts
│   ├── medication.ts
│   └── diet.ts
└── hooks/                  # Custom React hooks
```

#### Design Patterns

- **Domain-Driven Design**: Separate stores, types, and components by health domain
- **Component Composition**: Small, focused components with single responsibility
- **Type Safety**: TypeScript strict mode, no `any` types
- **Separation of Concerns**: Business logic in stores, presentation in components
- **Dependency Injection**: Use Zustand's context when needed

---

### 4. Test-Driven Development (TDD) 🧪

**All behavior changes require tests written first.**

#### Testing Standards

- **Coverage Requirements**: 90%+ for statements, branches, functions, lines
- **TDD Workflow**: Red → Green → Refactor
  1. Write failing test
  2. Implement minimum code to pass
  3. Refactor for quality

#### Test Pyramid

```
        /\
       /E2E\       10% - Critical user flows (Playwright)
      /------\
     /  Int   \    30% - Component + Store integration (Vitest + Testing Library)
    /----------\
   /    Unit    \  60% - Pure functions, utils, stores (Vitest)
  /--------------\
```

#### Test Categories

1. **Unit Tests** (`*.test.ts|tsx`)
   - Zustand stores (actions, state, persistence)
   - Utility functions
   - Validation schemas
   - Analytics calculations

2. **Integration Tests**
   - Component + Store interaction
   - Form submission → Data persistence
   - Multi-step workflows

3. **E2E Tests** (`e2e/*.spec.ts`)
   - Pain tracking flow
   - Exercise session logging
   - Medication tracking
   - Offline functionality

#### Critical Test Requirements

- **Medical Safety**: 100% coverage for contraindication logic
- **Data Validation**: 100% coverage for Zod schemas
- **Fast Execution**: Unit tests < 30s, E2E < 5min
- **Deterministic**: No flaky tests; use proper mocking

```typescript
// Example: TDD for pain store
describe('PainStore', () => {
  it('should add pain log and persist to IndexedDB', async () => {
    const store = usePainStore.getState();
    const entry = createMockPainLog();

    await store.addPainLog(entry);

    expect(store.painLogs).toContainEqual(entry);
    expect(await db.painLogs.get(entry.id)).toEqual(entry);
  });
});
```

**Enforcement**: PRs with failing tests or <90% coverage will be rejected.

---

### 5. Elegant UI with Accessibility ♿

**Beautiful, intuitive, and universally accessible.**

#### Design Principles

- **Calming Aesthetics**: Blues (trust, calm) and greens (healing, growth)
- **Clarity Over Complexity**: Minimize cognitive load
- **Progressive Disclosure**: Show advanced features only when needed
- **Feedback-Rich**: Loading states, success/error notifications, progress indicators

#### Accessibility Standards (WCAG 2.1 AA)

- **Keyboard Navigation**: All interactive elements accessible via Tab, Enter, Escape
- **Screen Reader Support**: Proper ARIA labels, semantic HTML
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44x44px for tap areas
- **Focus Indicators**: Visible focus rings with high contrast
- **Motion**: Respect `prefers-reduced-motion` for animations
- **Responsive**: Mobile-first, works on 320px to 1920px+ screens

#### Component Standards

```tsx
// Example: Accessible button
<Button
  aria-label="Log pain level 7"
  onClick={handlePainLog}
  className="min-h-11 min-w-11" // 44px touch target
>
  Log Pain
</Button>
```

**Dark Mode**: Full support via Tailwind CSS dark: variants

**Enforcement**: Lighthouse Accessibility score must be > 95.

---

### 6. Data Privacy & Offline-First 🔒

**User owns their data. No tracking, no telemetry, no third-party access.**

#### Privacy Principles

- **Local-First**: All data stored in IndexedDB; backend is optional enhancement
- **No Analytics**: Zero third-party tracking (Google Analytics, Mixpanel, etc.) without explicit opt-in
- **Encryption**: Sensitive medical data encrypted at rest (future enhancement)
- **Export/Import**: User can export all data as JSON and delete account
- **No Cookies**: Session management via localStorage only
- **GDPR Compliant**: Right to access, rectify, erase data

#### Offline Capabilities

- **Service Worker**: Cache app shell, assets, and API responses
- **IndexedDB**: Primary data store, syncs with backend when online
- **Optimistic UI**: Always responsive, even offline
- **Background Sync**: Queue actions when offline, sync when connected

```typescript
// Example: Offline-first data persistence
async function savePainLog(log: PainLog) {
  // Always save locally first
  await db.painLogs.add(log);

  // Attempt server sync if online
  if (navigator.onLine) {
    try {
      await api.painLogs.create(log);
    } catch (error) {
      // Queue for background sync
      await queueBackgroundSync('pain-logs', log);
    }
  }
}
```

**Enforcement**: All features must work offline; API calls optional.

---

### 7. Progressive Enhancement & Scalability 📈

**Build for today, architect for tomorrow.**

#### Current Phase: Single-User MVP
- Client-side app (Next.js 15)
- IndexedDB persistence
- No authentication needed
- Deployed on Netlify

#### Future Phases

**Phase 2: Backend Integration**
- PostgreSQL + Drizzle ORM
- Fastify API server
- JWT authentication
- Redis caching

**Phase 3: Multi-User (Optional)**
- User authentication
- Data isolation
- Shared exercise library
- Clinician portal

#### Scalability Principles

- **Modular Services**: Domain logic in separate modules, easy to extract to microservices
- **Feature Flags**: Use flags for gradual rollout
- **Database Migrations**: Reversible, documented migrations (Drizzle Kit)
- **API Versioning**: `/api/v1/` for future compatibility
- **Horizontal Scaling**: Stateless API design, Redis session store

**Enforcement**: No tight coupling; easy to swap IndexedDB → PostgreSQL.

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety (strict mode) |
| **Tailwind CSS** | 4.1.14 | Utility-first styling |
| **Radix UI** | Latest | Unstyled accessible primitives |
| **Shadcn/UI** | Latest | Pre-styled components |
| **Zustand** | 5.0.8 | State management |
| **React Hook Form** | 7.65.0 | Form handling |
| **Zod** | 4.1.12 | Schema validation |
| **Lucide React** | 0.546.0 | Icon library |
| **Date-fns** | 4.1.0 | Date manipulation |

### Backend (Future)

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16+ | Primary database |
| **Drizzle ORM** | Latest | Type-safe ORM |
| **Fastify** | 4+ | API server |
| **Redis** | 7+ | Caching layer |
| **Zod** | 4.1.12 | Runtime validation |

### DevOps & Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | Latest | Unit/integration testing |
| **Playwright** | Latest | E2E testing |
| **Testing Library** | Latest | Component testing |
| **ESLint** | Latest | Code linting |
| **Prettier** | Latest | Code formatting |
| **Husky** | Latest | Git hooks |
| **Lint-staged** | Latest | Pre-commit checks |
| **GitHub Actions** | N/A | CI/CD pipeline |

### Deployment

- **Hosting**: Netlify
- **CDN**: Netlify Edge
- **Node Version**: 20.x LTS
- **Package Manager**: pnpm (via Corepack)

---

## Development Workflow

### 1. Feature Specification
- Use `.claude/prompts/feature-spec.md` template
- Define user story, acceptance criteria, safety considerations
- Review with `/safety` checklist if health-related

### 2. Design
- Create wireframes/mockups
- Verify accessibility (keyboard nav, color contrast)
- Ensure mobile-first responsive design

### 3. Test Writing (TDD)
- Write failing tests first
- Use `.claude/prompts/test-plan.md` template
- Aim for 90%+ coverage

### 4. Implementation
- Follow architecture patterns
- Use TypeScript strict mode
- Optimize for performance budgets

### 5. Code Review
- Use `.claude/prompts/code-review.md` template
- Run `/review` checklist
- Verify medical safety (if applicable)

### 6. Quality Gates
- Run `/build` to verify:
  - TypeScript compiles
  - Linting passes
  - Tests pass (>90% coverage)
  - Build succeeds
  - Bundle size < 200KB

### 7. Commit
- Use conventional commits (feat/fix/docs/etc.)
- Run `/commit` for guided process
- One logical change per commit

### 8. Deployment
- PRs trigger preview deployment
- Merge to main triggers production deployment
- Monitor Lighthouse scores post-deploy

---

## Quality Standards

### Code Quality

- **TypeScript Strict Mode**: 100% compliance
- **No `any` Types**: Use proper typing or `unknown`
- **ESLint**: Zero errors, zero warnings
- **Prettier**: Consistent formatting
- **Comments**: Complex logic must be documented
- **No Dead Code**: Remove unused imports, variables, functions

### Performance

- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: > 95
- **Bundle Size**: < 200KB gzipped
- **Core Web Vitals**: Pass all metrics

### Security

- **Input Validation**: Zod schemas for all user input
- **XSS Prevention**: React auto-escaping + DOMPurify if needed
- **SQL Injection**: Parameterized queries only (Drizzle ORM)
- **CSRF Protection**: SameSite cookies, CSRF tokens
- **Secrets Management**: Never commit secrets; use env variables

---

## Dependency Management

### Adding Dependencies

1. **Evaluate Need**: Can we build it ourselves? Is it maintained?
2. **Check Bundle Size**: Use https://bundlephobia.com
3. **Verify TypeScript Support**: Must have types
4. **Security Audit**: Check for vulnerabilities
5. **Install One at a Time**: `pnpm add package-name`
6. **Document Why**: Add comment in package.json

### Updating Dependencies

- Use Renovate/Dependabot for automated PRs
- Test thoroughly before merging
- Review breaking changes in CHANGELOG

---

## Medical Safety Protocols

### Exercise Addition Checklist

Before adding any exercise:

1. **Verify Safety**: Research contraindications for cervical/thoracic/lumbar spine issues
2. **Document Form**: Provide detailed instructions with images/videos
3. **Tag Contraindications**: Mark exercises unsafe for specific conditions
4. **Progressive Levels**: Offer beginner → intermediate → advanced variations
5. **Include Rest Periods**: Specify rest between sets
6. **Test Validation**: Write tests to prevent unsafe exercises from being logged

### Pain Tracking Guidelines

- Use 0-10 numeric pain scale (validated tool)
- Track location, intensity, triggers, relief
- Never suggest self-diagnosis
- Encourage clinician consultation for persistent pain

---

## Monitoring & Observability

### Metrics to Track (Future)

- **Performance**: Core Web Vitals, API latency, page load times
- **Errors**: Crash rate, error frequency by type
- **Usage**: Feature adoption, daily active usage
- **Health**: Pain trends, exercise completion rates (anonymized aggregates)

### Logging

- **Client**: Console errors only in development
- **Server**: Structured logs (Pino) with log levels
- **Privacy**: Never log medical data or PII

---

## Roadmap Alignment

All work must align with the phased roadmap in `.specify/memory/roadmap.md`:

- **Phase 1 (Weeks 1-6)**: MVP - Pain tracking, exercise library, posture timer, medication tracking
- **Phase 2 (Weeks 7-13)**: Data insights - Diet tracking, progress visualization, adaptive plans
- **Phase 3 (Weeks 14-18)**: Long-term wellness - Blood reports, advanced dietary guidance, educational content

---

## Conflict Resolution

When requirements conflict with constitution principles:

1. **Medical Safety** > All other concerns
2. **Performance** > Feature richness
3. **Accessibility** > Aesthetics
4. **Privacy** > Convenience
5. **Simplicity** > Complexity

If in doubt, surface the conflict in PR review and discuss.

---

## Enforcement

This constitution is enforced through:

- **AGENTS.md**: AI assistant guardrails
- **Pre-commit Hooks**: Lint, format, test
- **CI/CD**: Automated quality gates
- **Code Review**: Human review using `/review` checklist
- **Lighthouse CI**: Performance and accessibility audits

---

## Amendments

This constitution may be amended through:

1. Proposal in GitHub issue
2. Team discussion (or personal reflection for solo dev)
3. Update constitution.md
4. Communicate changes to all stakeholders

**Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-11-01 | Initial constitution | Claude |

---

## Conclusion

This constitution ensures the Health Rehab project remains true to its mission: building a **safe, fast, accessible, and privacy-respecting** rehabilitation assistant for Haneef's spine health journey.

**Every line of code, every design decision, and every feature must honor these principles.**

---

**Questions or Conflicts?** Refer to:
- `AGENTS.md` - Quick safety guardrails
- `.specify/memory/architecture.md` - Technical architecture
- `.specify/memory/design-system.md` - UI/UX standards
- `.specify/memory/roadmap.md` - Feature priorities
