# Step 9 — Automation Engine

## Status

The Automation Engine is implemented as a server-side scheduled service.

### Supported rule types
- Daily Quiz
- Weekly Quiz
- Notification

### Execution model

Automation Rule → Scheduler → Idempotency Lock → Action → Automation Run Log

The scheduler runs hourly using the Asia/Kolkata timezone. Daily rules are eligible each day. Weekly rules are eligible on Monday. An idempotency lock ensures a rule executes at most once for its schedule period even though the scheduler wakes hourly.

### Daily / weekly quiz

The engine searches for an active, published quiz matching the rule type. The selected quiz ID is written to platform settings as dailyQuizId or weeklyQuizId.

### Notifications

Notification automation creates a server-side notificationJobs record with rule ID, action, queued status and timestamp. Actual delivery providers remain separate from the automation engine so email, push, SMS and other providers can be added later without rewriting the scheduler.

### Execution records

Every attempted action creates an automationRuns record containing rule ID, type, success, message, target ID/job ID, run key and timestamp.

### Manual test execution

An admin-only callable runAutomationEngineNow is available for controlled testing and uses the same idempotency mechanism as the scheduled engine.

### Safety

Automation rules remain disabled by default unless explicitly enabled. Actions run server-side.
