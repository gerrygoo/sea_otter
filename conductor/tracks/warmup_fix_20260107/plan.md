# Plan: Structured Warmup/Cooldown Protocols & Fix

## Phase 1: Engine Refactor & Enforcement [checkpoint: 424c433]
- [x] Task: Create reproduction test `src/lib/engine/warmup_bug.spec.ts` 424c433
    - Verify that a 45-minute workout fails if it lacks warmup/cooldown (simulated by mocking generators or constraints).
- [x] Task: Update `generateWorkout` in `src/lib/engine/index.ts` 424c433
    - Enforce mandatory Warmup/Cooldown for workouts ≥ 40 mins.
    - Implement budget "stealing" logic: Calculate minimum required warmup time (e.g. 5 mins) and reserve it before allocating Main Set.
    - If generators return empty, insert fallback sets (e.g. `100 Free Easy`).
- [x] Task: Conductor - User Manual Verification 'Engine Refactor & Enforcement' (Protocol in workflow.md) 424c433

## Phase 2: Structured Protocols [checkpoint: 41eae00]
- [x] Task: Create `src/lib/engine/generators/protocol_warmup.ts` 41eae00
    - Implement `ProtocolWarmupGenerator` with 3 phases: Loosening, Activation, Priming.
    - Implement logic to branch Priming based on `context.focus`.
- [x] Task: Create `src/lib/engine/generators/protocol_cooldown.ts` 41eae00
    - Implement `ProtocolCooldownGenerator`.
    - Implement logic to scale volume based on main set intensity (passed via context or assumed based on focus).
- [x] Task: Register new generators in `src/lib/engine/index.ts` 41eae00
    - Replace existing `WarmupGenerators` and `CooldownGenerators` with the new protocol generators (or add them with high priority).
- [x] Task: Conductor - User Manual Verification 'Structured Protocols' (Protocol in workflow.md) 41eae00

## Phase 3: Validation & Cleanup
- [ ] Task: Create `src/lib/engine/protocol.spec.ts`
    - Verify that `ProtocolWarmupGenerator` produces 3 phases.
    - Verify Priming logic matches Focus (Build for Endurance, Fast for Speed).
- [ ] Task: Run full test suite and ensure no regressions.
- [ ] Task: Conductor - User Manual Verification 'Validation & Cleanup' (Protocol in workflow.md)
