---
description: Guide through conventional commit creation with safety checks
---

Create a conventional commit with proper formatting and safety verification.

## Pre-Commit Checklist

### 1. Code Quality
- [ ] TypeScript compiles without errors
- [ ] All tests pass (if configured)
- [ ] No ESLint errors (if configured)
- [ ] Code is formatted (Prettier)

### 2. Safety Verification
- [ ] Medical safety constraints respected (if health-related)
- [ ] No removal of safety disclaimers
- [ ] Performance budget maintained

### 3. Documentation
- [ ] README updated (if public API changed)
- [ ] Comments added for complex logic
- [ ] Type definitions updated

## Conventional Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, etc.

### Scopes (Examples)
- pain-tracking
- exercise-library
- medication
- diet
- ui
- store
- db
- types

### Examples

```
feat(pain-tracking): add pain intensity trend chart

Implement weekly pain trend visualization using recharts.
Displays pain levels over 7-day period with color-coded
severity indicators.

Closes #23
```

```
fix(exercise-store): prevent duplicate session entries

Add unique constraint check before persisting exercise
sessions to IndexedDB.

Fixes #45
```

```
docs(safety): update contraindication guidelines

Clarify L4/L5 disc bulge exercise restrictions based
on clinician feedback.
```

## Commit Process

1. **Stage Changes**
   ```bash
   git add <files>
   ```

2. **Review Staged Changes**
   ```bash
   git diff --staged
   ```

3. **Create Commit**
   ```bash
   git commit -m "type(scope): subject"
   ```

4. **Verify Commit**
   ```bash
   git log -1
   ```

## Usage

`/commit` - Start guided commit process

## Best Practices

- Keep subject line < 72 characters
- Use imperative mood ("add" not "added")
- Explain WHY, not just WHAT
- Reference issues/PRs when applicable
- One logical change per commit
- Run `/build` before committing

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices)
