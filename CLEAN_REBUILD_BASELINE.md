# Skill Saga — Clean Rebuild Baseline

This branch is the isolated development baseline for the next Skill Saga release.

## Rules

- `main` remains untouched by this rebuild.
- The APK recovery source and the latest GitHub implementation were used as recovery references.
- Runtime uses one canonical application entrypoint:
  - `index.html`
  - `app/src/main/assets/index.html`
- The two canonical entrypoints are kept identical.
- Legacy backup HTML files, alternate index copies, legacy web patch/force layers, and self-modifying repair workflows are excluded from this branch.
- Firebase configuration is valid JSON and deploys Firestore rules from `firestore.rules`.
- Web deployment is built from the canonical Android asset HTML plus the canonical supporting runtime modules.
- Admin Console v3 remains part of the canonical runtime.

## Core runtime

Login → Home → Learn → Play → Quiz → Result → History → Profile

Admin → Admin Console → Home Controls → Content/Quiz → Competition → Operations/Community

## Verification gate before merge/deploy

1. Validate HTML/JavaScript syntax.
2. Build APK successfully.
3. Build web output successfully.
4. Verify Firebase rules/config deployment.
5. Test learner flow end-to-end.
6. Test admin controls and learner-facing changes.
7. Test parent/teacher linking and data sync.
8. Only then create a pull request to `main`.

## Recovery reference

The protected APK supplied during the rebuild contains the verified Admin Console v3 build marker referencing source commit:

`b125fd8816564276e8158c41b2c0f831cd1530ec`

This branch is not a replacement for that APK backup; it is the clean working source reconstructed from the available current sources.
