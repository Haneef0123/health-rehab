---
description: Comprehensive code review checklist
---

Perform a thorough code review using health-specific and general quality criteria.

## Medical Safety Review

### Exercise & Health Features
- [ ] No contraindicated exercises added
- [ ] Cervical lordosis constraints respected
- [ ] Thoracic kyphosis considerations included
- [ ] L4/L5-S1 disc bulge restrictions enforced
- [ ] Safety disclaimers present in UI
- [ ] Clinician consultation reminders shown
- [ ] Medical data validated before storage

### Data Privacy
- [ ] No third-party analytics without consent
- [ ] Sensitive health data encrypted
- [ ] No logging of medical information
- [ ] GDPR compliance maintained

---

## Performance Review

### Load Time
- [ ] Initial page load < 1.5s (FCP < 1.0s, LCP < 1.5s)
- [ ] No synchronous blocking operations
- [ ] Lazy loading used for heavy components
- [ ] Code splitting implemented

### Runtime Performance
- [ ] UI interactions < 100ms response time
- [ ] No unnecessary re-renders
- [ ] Optimistic UI updates where applicable
- [ ] Efficient state management

### Bundle Size
- [ ] Total bundle < 200KB gzipped
- [ ] No duplicate dependencies
- [ ] Tree-shaking optimized
- [ ] Images optimized (WebP, proper sizing)

---

## Code Quality Review

### TypeScript
- [ ] Strict mode compliance (no `any` types)
- [ ] Proper type annotations
- [ ] No TypeScript errors or warnings
- [ ] Type definitions exported for shared code

### Testing
- [ ] Tests added for new features
- [ ] Tests updated for changed features
- [ ] Edge cases covered
- [ ] Coverage > 90% maintained
- [ ] Tests are fast (< 30s total)

### Code Style
- [ ] ESLint rules followed (when configured)
- [ ] Consistent formatting (Prettier)
- [ ] Meaningful variable names
- [ ] Functions are small and focused
- [ ] No commented-out code

### Error Handling
- [ ] User-friendly error messages
- [ ] Errors logged appropriately
- [ ] Graceful degradation
- [ ] Loading states implemented
- [ ] Empty states handled

---

## Architecture Review

### Component Design
- [ ] Single Responsibility Principle
- [ ] Proper component hierarchy
- [ ] Reusable components in `src/components/ui/`
- [ ] Domain components in appropriate directories

### State Management
- [ ] Zustand stores used correctly
- [ ] No prop drilling (use stores instead)
- [ ] State mutations isolated
- [ ] Persistence handled correctly (IndexedDB)

### Data Flow
- [ ] Unidirectional data flow
- [ ] Clear separation of concerns
- [ ] API contracts maintained
- [ ] Type-safe data transformations

---

## Accessibility Review (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Screen Readers
- [ ] Proper ARIA labels
- [ ] Semantic HTML used
- [ ] Alt text for images
- [ ] Form labels associated

### Visual
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Text resizable to 200%
- [ ] No information conveyed by color alone
- [ ] Touch targets ≥ 44x44px

---

## Security Review

### Input Validation
- [ ] All user inputs validated (Zod schemas)
- [ ] XSS prevention (React auto-escaping)
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection (if API endpoints)

### Authentication & Authorization
- [ ] Auth checks on protected routes
- [ ] Tokens stored securely
- [ ] Session expiration handled
- [ ] No sensitive data in URLs

---

## Documentation Review

### Code Comments
- [ ] Complex logic explained
- [ ] TODOs tracked properly
- [ ] Medical safety notes included
- [ ] API documentation (JSDoc/TSDoc)

### User-Facing Docs
- [ ] README updated if needed
- [ ] CHANGELOG updated
- [ ] Migration guides provided
- [ ] User-facing changes documented

---

## Git Review

### Commits
- [ ] Conventional commit format
- [ ] Atomic commits (one logical change)
- [ ] Descriptive commit messages
- [ ] No secrets in commit history

### Branch
- [ ] Branched from correct base
- [ ] Up to date with main
- [ ] No merge conflicts
- [ ] Clean commit history

---

## Testing Checklist

### Manual Testing
- [ ] Feature works in Chrome, Firefox, Safari
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Offline functionality tested
- [ ] Dark mode works (if applicable)

### Automated Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (when configured)
- [ ] Visual regression tests (if applicable)

---

## Final Checks

- [ ] `/build` passes successfully
- [ ] No console errors or warnings
- [ ] Performance Lighthouse score > 90
- [ ] Accessibility Lighthouse score > 95

---

## Usage

`/review` - Run complete code review checklist

## References

- **AGENTS.md**: Safety and performance guardrails
- **.specify/memory/constitution.md**: Core principles
- **CLAUDE_OPTIMIZATION_ROADMAP.md**: Quality standards
