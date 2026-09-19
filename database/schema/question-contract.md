# Question Contract v1

Required:
- questionId
- questionText
- questionType
- options
- correctAnswer
- explanation
- boardId
- classId
- subjectId
- chapterId
- topicId
- skillId
- difficulty
- language
- tags
- status
- createdBy
- approvedBy

## Import lifecycle

UPLOAD → VALIDATE → ERROR REPORT / PREVIEW → APPROVE → IMPORT

Questions remain reusable assets. A quiz references eligible questions rather than duplicating question content unnecessarily.
