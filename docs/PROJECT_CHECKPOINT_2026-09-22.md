# Skill Saga 2.0 — Project Checkpoint
Date: 2026-09-22

## Current milestone
Content Manager -> Question Bank -> Quiz Manager -> Learner workflow is being completed.

## Academic data
- Classes 1–12 academic structure is present.
- Class 1 subjects: Mathematics, English, Hindi.
- Class 1 totals: 41 chapters.
- Class 1 content pack: 41 study materials + 41 practice quiz PDFs.
- Class 1 Question Bank dataset: 205 MCQs.

## Question Bank
- Bulk CSV prepared: Class1_Question_Bank_205_Import.csv.
- Question Bank UI is loading successfully.
- CSV importer accepts board/class/subject/chapter/topic aliases.
- Chapter/topic matching has normalization and safe fuzzy matching.
- Latest Question Bank backend source fix commit: 2312941c8fc93a8cdd026f49e1f09f10e97994b7.
- Last user test still showed Chapter/Topic validation errors; retry is pending after latest backend deployment.
- Do NOT repeatedly import until the next test result is checked.

## Firebase deployment
Latest deployment run: Skill Saga Firebase Deploy #69.
- TypeScript/function build passed.
- Question-related functions deployed successfully, including listQuestions and bulkCreateQuestions.
- Content functions deployed successfully.
- Quiz functions deployed successfully.
- Deployment overall ended with exit code 2 only because scheduled functions could not update Cloud Scheduler jobs due to missing IAM permission cloudscheduler.jobs.update.
- Affected scheduled functions: runAutomationEngine and runCompetitionLifecycle.
- This IAM issue is separate from Question Bank functionality.

## Quiz Manager
- Quiz Manager is connected to Question Bank.
- It loads active questions and filters by board/class/subject/chapter/topic.
- Question type includes academic IDs.
- Next step after successful Question Bank import: verify questions in Quiz Manager and create the first real Class 1 quizzes.

## Content Manager
- Bulk import and Storage mapping work was implemented.
- Firebase Storage bucket: gs://skill-saga-2.firebasestorage.app
- Individual Class 1 PDFs were uploaded.
- One manual learning-content record was created previously.
- listLearningMaterials has now deployed successfully.

## Local development
- Admin Next.js server is already running on port 3001 in Codespace.
- Do not start a second Next.js server unless needed.
- If a restart is necessary, stop the existing PID shown by Next.js and run pnpm --dir apps/admin dev.

## Important commits
- Question Bank parser/build fixes and academic mapping fixes were made in successive commits.
- Latest source correction: 2312941c8fc93a8cdd026f49e1f09f10e97994b7.
- CI on the latest commit passed.
- Phase 2 Security on the latest commit passed.
- Pages deployment on the latest commit passed.

## Tomorrow — exact next sequence
1. Open Question Bank.
2. Ctrl+Shift+R.
3. Select the same Class 1 205-question CSV.
4. Click Import Questions once.
5. If successful: verify count and academic mapping.
6. If Chapter/Topic error remains: inspect exact Class 1 academic records and fix mapping, rather than changing the CSV blindly.
7. Then open Quiz Manager.
8. Create the first real Class 1 Mathematics/English/Hindi quizzes from Question Bank.
9. Test learner-side quiz visibility, attempt, scoring, XP/coins and result flow.
10. Only after this workflow is verified, continue with broader Class 1 content import and production hardening.

## Do not do
- Do not delete existing working UI/admin files.
- Do not bulk-import the 82 Content Manager records until listLearningMaterials is confirmed healthy in the UI.
- Do not downgrade Node/Firestore dependencies without evidence.
- Do not repeatedly import the 205-question CSV after an error; inspect the exact error first.
