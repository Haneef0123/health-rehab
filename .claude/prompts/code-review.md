# Code Review Prompt Template

Use this template when reviewing code changes for the health-rehab project.

---

## Review Context

**File(s) changed:** [List files]
**Type of change:** [Feature/Fix/Refactor/Docs/etc.]
**Related issue:** [Issue number or description]

---

## Review Areas

### 1. Medical Safety (CRITICAL)

For any health/exercise/medical features:

- Does this change respect cervical lordosis loss constraints?
- Does this change respect thoracic kyphosis considerations?
- Does this change respect L4/L5-S1 disc bulge restrictions?
- Are safety disclaimers maintained or added where needed?
- Are contraindicated movements avoided?
- Is medical data handled securely?

**Medical Safety Rating:** ✅ Safe / ⚠️ Review Needed / ❌ Unsafe

---

### 2. Performance Impact

- Bundle size impact: [Estimated change in KB]
- Runtime performance: [Any new expensive operations?]
- Load time impact: [Does this affect initial load?]
- Network requests: [New API calls added?]

**Performance Impact:** ✅ Minimal / ⚠️ Moderate / ❌ Significant

---

### 3. Code Quality

- TypeScript strict mode compliance: ✅/❌
- Test coverage: [Current % → New %]
- ESLint compliance: ✅/❌
- Component design: [Comments on structure]
- State management: [Proper use of Zustand?]

**Code Quality Rating:** ✅ Good / ⚠️ Needs Work / ❌ Poor

---

### 4. Accessibility

- Keyboard navigation: ✅/❌/N/A
- Screen reader compatibility: ✅/❌/N/A
- Color contrast: ✅/❌/N/A
- Touch target sizes: ✅/❌/N/A

**Accessibility Rating:** ✅ Accessible / ⚠️ Minor Issues / ❌ Inaccessible

---

### 5. Testing

- Unit tests added/updated: ✅/❌/N/A
- Integration tests: ✅/❌/N/A
- E2E tests: ✅/❌/N/A
- Edge cases covered: ✅/❌

**Test Coverage:** ✅ Comprehensive / ⚠️ Partial / ❌ Missing

---

## Specific Feedback

### Strengths
[What was done well]

### Issues Found
[Specific problems to address]

### Suggestions
[Improvements to consider]

---

## Decision

- [ ] ✅ **Approve** - Ready to merge
- [ ] ⚠️ **Approve with Comments** - Merge OK, but consider feedback
- [ ] 🔄 **Request Changes** - Must address issues before merge
- [ ] ❌ **Reject** - Fundamental problems, needs redesign

---

## Action Items

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

---

## References

- AGENTS.md - Safety guardrails
- .specify/memory/constitution.md - Core principles
- PROJECT_SUMMARY.md - Project context
