# Academic Service

The academic service is the only supported mutation boundary for academic configuration.

Mutation pipeline:

Request → authentication → role authorization → validation → Firestore/Admin SDK → audit log.

Supported collections:
`boards`, `classes`, `subjects`, `chapters`, `topics`, `skillCategories`, `skills`.

Destructive deletion is intentionally not part of the contract. Use archive/deactivate so historical content can retain references.
