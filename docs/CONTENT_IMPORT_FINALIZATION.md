# Step 8 — Content and Import System Finalization

## Production content flow

Skill Saga content is organized as:

`Board → Class → Subject → Chapter → Topic → Skill → Question → Quiz`

The import system validates dependencies before writing content.

## Academic bulk import

Academic imports support up to 5,000 rows per request and process entities in dependency order:

1. Boards
2. Classes
3. Subjects
4. Chapters
5. Topics
6. Skill categories
7. Skills

Relationships are resolved before writes. Existing subject mappings can be reused safely when the same subject/code + board + class mapping already exists.

The import returns row-level validation errors instead of writing an invalid import.

## Question bulk import

Question bulk import supports up to 5,000 rows and is exported through the Functions entry point.

Each question is validated for:

- non-empty question text
- exactly four non-empty options
- correct option
- difficulty
- positive marks
- board/class/subject/chapter/skill references
- active academic references
- draft/published status
- duplicate question text within a chapter

Questions can be supplied using IDs or supported board/class/subject codes and chapter/skill names.

## Publishing safety

A published question must have valid active academic references.

A published quiz must contain only active, published questions.

This creates the dependency chain:

`Academic → Question → Quiz → Learner`

## Safe import principle

Validation is performed before the write phase. Invalid input returns row numbers and messages, and the normal validation path performs no content writes.

Writes are chunked into Firestore batches so large imports do not exceed Firestore batch limits.

## Content lifecycle

Use:

`Draft → Validate → Review → Published → Archive`

Archive is preferred to destructive deletion so historical references remain intact.

## Before large-scale upload

The next content population phase should use small test batches first:

1. 1 board
2. 1 class
3. 1 subject
4. a few chapters
5. a few topics
6. a few skills
7. 5–10 questions
8. 1 quiz
9. publish
10. learner verification

Only after this controlled sample passes should the large CBSE/other-board datasets be imported.
