# Skill Saga — Academic Learn Schema

## Purpose
Define the stable data/content hierarchy for the Learn section without changing the current learner UI.

## Hierarchy

Student → Class → Subject → Chapter → Topic → Lesson

## Content model

```text
AcademicContent
├── id
├── classId        # class_1 ... class_12
├── subjectId
├── subjectName
├── chapterId
├── chapterName
├── topicId
├── topicName
├── lessonId
├── lessonTitle
├── lessonType     # text | video | image | mixed
├── content
├── order
├── estimatedMinutes
├── skillTags[]
├── quizIds[]
├── status         # draft | published | scheduled
├── createdAt
└── updatedAt
```

## Navigation contract

1. Select Academic.
2. Select Class 1–12.
3. Select Subject.
4. Select Chapter.
5. Select Topic.
6. Open Lesson.
7. Offer `Practice this topic` to launch the existing quiz engine.

## Rules

- Academic content is class-aware.
- Class selection must use a central `gradeId`/`gradeLevel` rather than scattered hard-coded class logic.
- Skills and Other remain outside this hierarchy and are cross-grade.
- Existing quiz engine remains the practice destination.
- This schema is architecture only until the final UI integration pass.
