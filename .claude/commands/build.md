---
description: Run complete build verification pipeline
---

Execute the full build verification pipeline to ensure code quality and deployability.

## Build Pipeline Steps

1. **Type Check**
   - Run: `npx tsc --noEmit`
   - Verify: Zero TypeScript errors

2. **Lint Check** (when configured)
   - Run: `npm run lint`
   - Verify: Zero ESLint errors/warnings

3. **Test Suite** (when configured)
   - Run: `npm test`
   - Verify: All tests pass, coverage > 90%

4. **Production Build**
   - Run: `npm run build`
   - Verify: Build completes successfully

5. **Bundle Size Check**
   - Analyze: `.next/` bundle size
   - Verify: Total gzipped size < 200KB (target from AGENTS.md)

## Usage

`/build` - Run complete pipeline

## Success Criteria

- ✅ No TypeScript errors
- ✅ No linting errors (when configured)
- ✅ All tests pass (when configured)
- ✅ Build succeeds
- ✅ Bundle size within performance budget
- ✅ No build warnings

## Performance Targets (from AGENTS.md)

- Build time: < 60 seconds
- Bundle size: < 200KB gzipped
- Initial load: < 1.5s
- Interactive updates: < 100ms

## Note

Run this command before every commit to ensure code quality.
