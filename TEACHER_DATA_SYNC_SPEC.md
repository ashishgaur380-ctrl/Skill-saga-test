# Skill Saga — Teacher/Learner Data Sync Specification

## Current deferred issue

Teacher Dashboard learner statistics currently do not reflect the learner's actual activity correctly. The tested teacher linking and quiz assignment/completion flow works, but dashboard aggregation needs a later targeted fix.

## Canonical learner metrics

- total XP
- total coins
- current level
- current streak
- quizzes completed
- accuracy
- skill mastery
- recent attempts
- assigned quiz status

## Data principle

The learner profile/progress record and quiz-attempt records should be the source of truth. Teacher Dashboard should read the learner's current authorized data rather than maintaining a competing manually updated copy.

## Required checks for final fix

1. Teacher is authorized for the learner.
2. Learner progress is loaded from the canonical learner record.
3. Quiz attempts are aggregated consistently.
4. Accuracy uses the same percentage definition as learner Quiz History.
5. Assignment completion is reflected in assigned-quiz status.
6. Empty/new learner states show zero values without errors.
7. Firestore rules prevent unauthorized cross-learner access.

## Integration rule

Do not rewrite the large finalized index.html for this issue. Make a targeted patch during the consolidated manual integration pass and retest teacher dashboard, learner profile, quiz history and assignment completion together.
