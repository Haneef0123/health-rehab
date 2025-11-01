---
description: Verify medical safety compliance before implementing health features
---

Execute medical safety checklist before implementing any exercise, health, or rehabilitation features.

## Medical Safety Checklist

### 1. Medical Condition Constraints

- [ ] **Cervical Lordosis Loss**: No exercises that compress or strain the neck
- [ ] **Thoracic Kyphosis**: No exercises that worsen forward curvature
- [ ] **L4/L5-S1 Disc Bulge**: No compression-heavy movements

### 2. Contraindicated Movements

Verify NO inclusion of:
- [ ] Heavy deadlifts (compression risk)
- [ ] Crunches or sit-ups (spine flexion)
- [ ] Twisting motions under load
- [ ] Long unsupported sitting positions
- [ ] Overhead heavy pressing
- [ ] High-impact exercises

### 3. UI/UX Safety Elements

- [ ] Global safety disclaimer present in layout
- [ ] "Consult clinician" reminder visible
- [ ] Exercise contraindication warnings shown
- [ ] Pain level monitoring integrated
- [ ] Emergency stop/rest guidance provided

### 4. Data Safety

- [ ] Medical data stored securely (encrypted)
- [ ] No unauthorized third-party access
- [ ] Export functionality for clinician review
- [ ] Backup/restore capability present

### 5. Exercise Library Validation

If adding exercises:
- [ ] Exercise targets correct muscle groups
- [ ] Form instructions are detailed and safe
- [ ] Progression levels are gradual
- [ ] Rest periods are specified
- [ ] Contraindications are documented

### 6. Code Changes

- [ ] No removal of safety-critical code
- [ ] No bypass of medical validation logic
- [ ] Tests verify safety constraints
- [ ] Documentation updated

## Usage

`/safety` - Run before implementing health/exercise features

## References

- **AGENTS.md**: Non-negotiable safety principles
- **.specify/memory/constitution.md**: Full safety charter
- **PROJECT_SUMMARY.md**: Medical condition details

## Critical Principle

> "Anything that could affect the user's wellbeing must be explicit, documented, and reversible."
> — AGENTS.md

## When in Doubt

Surface conflicts between new requirements and medical safety standards. Always prioritize user safety over feature completion.
