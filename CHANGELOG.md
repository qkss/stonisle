# Changelog

## 2026-11-16

### Gameplay and world
- Add distinct exploration towns, conquest, guards, stewards, blueprints and specialist crafting workshops.
- Add medicinal herb cultivation, age-based alchemy quality, cereal crops and brewing.
- Expand furnaces, quantum railguns, relay prisms, railway tracks and cargo carts.
- Add flat-ground cart movement, curved/sloped track following and authoritative multiplayer cargo transactions.

### Cart automation
- Give each cart direction an executor slot and a material slot.
- Require an installed trigger before automation runs; configure its interval in travelled cells.
- Infer planting, fertilizing and mature-crop harvesting from the supplied item and target.
- Prevent repeated work at the same trigger step and preserve crops when harvest output cannot fit.

### Presentation and interaction
- Update character and weapon skins, first-person hands, materials, icons, lighting and ambient music.
- Use the native Wick voice for dialogue and vocabulary narration.
- Improve landscape mobile controls and container inventory layouts, including filtering, drag/drop and half-stack transfers.

### Validation
- Cover trigger gating, distance intervals, planting, mature-only harvest, capacity safety and cargo transaction replay protection with automated tests.
- Verify cart controls in an 844 × 390 landscape preview: no-trigger seed count remains 20; every-two-cell planting consumes 4 seeds; nine mature wheat cells yield 27 wheat and 12 seeds in the observed run.

### Not yet implemented
- Standalone ground placement and signal wiring for executors, triggers and detectors. This release includes cart-mounted executor/trigger functionality and shared foundations only.
