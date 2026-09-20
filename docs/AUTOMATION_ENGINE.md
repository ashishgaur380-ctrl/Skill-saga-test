# Step 9 — Automation Engine

## Status

The Automation module now has both rule management and a scheduled execution engine.

### Supported rule types

- `daily_quiz`
- `weekly_quiz`
- `notification`

### Execution

The scheduler runs hourly in UTC and evaluates enabled, active rules.

Daily rules are eligible every scheduler run.

Weekly rules are eligible on Monday UTC.

### Daily and weekly quiz automation

The engine looks for an active, published quiz whose title matches the rule type:

- Daily Quiz → title containing “daily”
- Weekly Quiz → title containing “weekly”

When found, its ID is stored in platform system settings as:

- `dailyQuizId`
- `weeklyQuizId`

This keeps the learner experience data-driven rather than requiring UI code changes.

### Notification automation

Notification rules create a server-side `notificationJobs` queue record with status `queued`.

Actual delivery providers are intentionally separated from rule execution. This allows email, push, SMS or other adapters to be added later without changing the automation rule contract.

### Audit / execution history

Each execution creates an `automationRuns` record containing:

- rule ID
- type
- success/failure
- message
- target ID where applicable
- execution timestamp

### Safety

Only enabled and active rules execute.

Automation remains server-side; learners cannot trigger administrator automation rules directly.

### Next integration

The notification delivery worker and provider adapters remain separate work for Step 10. The scheduler now provides the correct queue boundary for that work.
