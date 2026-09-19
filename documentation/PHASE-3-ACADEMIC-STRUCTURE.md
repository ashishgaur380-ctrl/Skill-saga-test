# Phase 3 - Academic Structure

The Admin Console is the source of truth for academic metadata. Learner, Play, Competition and Content modules consume this metadata rather than hardcoding it.

Hierarchy: Board → Class → Subject → Chapter → Topic. Skills use Skill Category → Skill.

Rules: stable IDs, editable names, `active` for availability, `sortOrder` for presentation, and deactivation/archive instead of destructive deletion when references exist.

Initial scope: Classes 1–12; CBSE, ICSE and State/other boards; board/class/subject mappings; chapters; topics; skills.
