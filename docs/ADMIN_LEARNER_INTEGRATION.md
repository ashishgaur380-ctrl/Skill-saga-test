# Step 7 — Admin → Backend → Learner Integration

## Verified architecture

The integration path is:

`Admin Console → Firebase callable Function → Firestore → Learner callable Function → Learner UI`

The browser does not directly control scoring or learner results.

## Critical publication dependency

A quiz can reference questions from the central Question Bank. Before publication, every referenced question must now satisfy:

- document exists
- `active == true`
- `status == "published"`

This prevents an Admin from publishing a quiz that the Learner app would later reject because one of its questions is still draft.

## End-to-end data contract

### 1. Question Bank

Admin creates/updates a question with:
- question text
- four options
- correct option
- marks
- academic references
- status
- active flag

### 2. Quiz Manager

Admin selects Question Bank IDs.

When publishing:
- referenced questions are revalidated server-side
- inactive questions are rejected
- draft questions are rejected
- quiz remains the source of the learner-facing assessment definition

### 3. Learner discovery

`listPublishedQuizzes` returns only:
- active quizzes
- published quizzes

### 4. Learner attempt

`getQuizForAttempt` revalidates:
- quiz is active
- quiz is published
- every referenced question is active
- every referenced question is published

Only safe question fields are returned. The correct answer is not returned to the learner.

### 5. Server-side scoring

`submitQuizAttempt` loads the question documents server-side and compares submitted options with the stored `correctOption`.

The browser cannot determine or submit the official score.

### 6. Result and progress

The server writes `quizAttempts` containing:
- learner ID
- quiz ID
- answer results
- correct count
- marks
- total marks
- percentage
- XP
- coins
- timestamp

Learner Home, Profile and Progress read these server-generated records.

### 7. Rewards

Coins are derived from completed quiz attempts. Reward redemption uses the learner's server-side coin calculation and records a redemption request.

### 8. Competition

Competition → Quiz → Questions follows the same server-side assessment boundary. A learner must join before submitting, and a competition submission is limited to one attempt per learner.

## Integration test sequence

1. Admin creates a Question Bank question.
2. Publish the question.
3. Admin creates a quiz containing that question.
4. Publish the quiz.
5. Learner Home discovers the quiz.
6. Learner opens it.
7. Learner answers all questions.
8. Server calculates result.
9. Server writes the attempt.
10. Home/Profile statistics reflect XP and coins.
11. Progress reflects the completed attempt.
12. Rewards reflects the earned coin balance.
13. Admin can subsequently archive the quiz/question.
14. Learner can no longer start an archived/unavailable assessment.

## Additional guard added in Step 7

Publishing a quiz now fails if any referenced question is still a draft. This closes the main Admin → Learner integration mismatch identified during the review.

## Live execution status

The repository-side integration contracts have been reviewed and the publication guard was fixed. A live authenticated click-through is still dependent on the controlled Firebase Auth session described in the authentication testing documentation. No live execution is claimed here.
