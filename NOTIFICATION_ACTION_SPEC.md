# Skill Saga — Notification Action Specification

## Current state

The notification bell and For You feed work. General learning notifications appear correctly. Pending teacher-assigned quizzes are not yet surfaced as an actionable notification.

## Required notification

When an authorized learner has an assignment with status `assigned` or other pending state, the notification feed should include:

- clear title, e.g. `New Quiz Assigned`
- quiz title
- assigned by teacher/admin context where appropriate
- pending status
- primary action: `Start Quiz`
- action opens the existing assigned-quiz flow

## Lifecycle

Assigned → notification shown → Start Quiz → quiz begins → completion → notification/assignment state refreshed.

## Rules

- Do not expose private teacher/learner information unnecessarily.
- Avoid duplicate notifications for the same assignment.
- Completed/cancelled assignments should no longer appear as pending actions.
- Existing bell UI remains unchanged until the final targeted integration patch.
