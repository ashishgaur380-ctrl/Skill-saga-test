# Skill Saga 2.0 — Question Bank Import Guide

## Working repository
- Repository: `ashishgaur380-ctrl/Skill-saga-test`
- Branch: `main`
- Firebase project: `skill-saga-2`
- Admin app: `apps/admin`
- Question Bank route: `/question-bank`

## Standard Admin startup

From Codespace:

```bash
cd /workspaces/Skill-saga-test
git pull origin main
cd apps/admin
npm run dev
```

If port 3000 is already occupied, use the existing server or restart it. Do not start a second Admin server unnecessarily.

## Firebase Question Bank deployment

Only needed after changing `functions/src/question.ts`:

```bash
cd /workspaces/Skill-saga-test
git pull origin main
npx firebase use
npx firebase deploy --only functions:bulkImportQuestions
```

Expected project:

```
skill-saga-2
```

Do NOT add `--force` unless specifically required.

## CSV header

Use exactly this logical schema:

```
questionText,option1,option2,option3,option4,correctOption,explanation,difficulty,marks,board,class,subject,chapter,topic,status
```

The Admin parser is case-insensitive for the supported aliases.

## Critical rules

1. Every question MUST have exactly 4 non-empty options.
2. `correctOption` is ZERO-BASED:
   - `0` = option1
   - `1` = option2
   - `2` = option3
   - `3` = option4
3. Never use `1,2,3,4` for `correctOption`.
4. For Class 6 CBSE, use:
   - boardCode: `CBSE`
   - classCode: `CBSE-6`
   - Mathematics subjectCode: `MATH-6`
5. `chapter` and `topic` must exactly match the active academic hierarchy.
6. Recommended difficulty values: `easy`, `medium`, `hard`.
7. Keep `marks` numeric.
8. Keep question text and options free of unescaped CSV commas, or quote the CSV cell correctly.
9. Save CSV as UTF-8.

## Import procedure

1. Start Admin.
2. Open `/question-bank`.
3. Hard refresh with Ctrl+Shift+R after frontend changes.
4. Choose the CSV template/file.
5. Click **Import Questions**.
6. Confirm the success message, e.g. `Imported 150 questions successfully.`
7. Confirm the active count increased.
8. Verify several imported questions show the expected chapter, subject, difficulty and published status.

## Troubleshooting history — do not repeat

### Error: Class/Subject not found
Use academic codes:
- `CBSE`
- `CBSE-6`
- `MATH-6`

### Error: Correct option must be 0, 1, 2 or 3
Do not regenerate the CSV immediately. First check:
- header is `correctOption`
- values are only `0,1,2,3`
- Admin frontend contains the `correctoption -> correctOption` alias mapping.

### Error: Received NaN
This was caused by the frontend lowercasing CSV headers to `correctoption` without mapping it back to `correctOption`. This has been fixed in `apps/admin/components/question-bank/question-bank-manager.tsx`.

### Error: Exactly 4 non-empty options are required
Inspect the indicated row. All four option columns must contain values. Do not leave option4 blank.

## Current verified Class 6 Mathematics import

The corrected 150-question Class 6 Mathematics file imported successfully.

Verified result:
- 150 active questions
- 0 draft
- Mathematics
- Class 6
- Questions visible in Question Bank

This successful import is the reference checkpoint for future bulk imports.

## Safe workflow for future classes

For each subject:
1. Confirm academic hierarchy first.
2. Prepare CSV from this template.
3. Validate every row has 4 options.
4. Validate correctOption is 0–3.
5. Validate board/class/subject/chapter/topic.
6. Import.
7. Confirm active count.
8. Only then move to the next subject.
