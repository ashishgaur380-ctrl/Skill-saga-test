# Skill Saga 2.0 — Authentication & Role Test Matrix

## Purpose

This document defines the role boundary that must hold across Admin, Learner, and Parent/Teacher experiences. Authentication identifies the Firebase account; the verified Firebase custom claim `role` controls authorization.

## Role matrix

| Role | Admin Console | Learner services | Guardian services | Sensitive admin mutations |
|---|---|---|---|---|
| `super_admin` | Allowed | Denied | Denied | Allowed, including privileged role assignment |
| `admin` | Allowed | Denied | Denied | Allowed except privileged role assignment |
| `content_manager` | Allowed | Denied | Denied | Academic/question/content operations only |
| `learner` | Denied | Allowed | Denied | Denied |
| `parent` | Denied | Denied | Allowed | Denied |
| `teacher` | Denied | Denied | Allowed | Denied |
| `school_admin` | Denied | Denied | Denied | Denied |
| `moderator` | Denied | Denied | Denied | Denied |
| `support` | Denied | Denied | Denied | Denied |
| `finance` | Denied | Denied | Denied | Denied |

## Code-level authorization verified

- Admin Console accepts only `super_admin`, `admin`, and `content_manager` through its auth gate.
- Academic and Question Bank callable writes accept only `super_admin`, `admin`, and `content_manager`.
- User management accepts only `super_admin` and `admin`.
- User assignment of `super_admin`, `admin`, or `finance` is restricted to `super_admin`.
- System Settings accepts only `super_admin` and `admin`.
- Learner callable services require the `learner` role.
- Parent/Teacher linking and linked-progress services require `parent` or `teacher`.
- Guardian UI now blocks accounts whose role is not `parent` or `teacher`.
- Guardian sign-in is now available directly in the portal.
- Learner authentication alone is not treated as sufficient authorization; the backend callable role check remains the trusted boundary.

## Manual test sequence

Run after Firebase/Auth test accounts are available:

1. Sign in as `super_admin`; open Admin Console and verify all permitted modules load.
2. Sign in as `admin`; verify Admin Console works and privileged role assignment is rejected.
3. Sign in as `content_manager`; verify Admin Console loads and sensitive user/system operations are rejected.
4. Sign in as `learner`; verify learner pages work and direct calls to admin/guardian services return permission denied.
5. Sign in as `parent`; verify guardian sign-in, linking and linked progress work; learner/admin calls return permission denied.
6. Sign in as `teacher`; verify the same guardian boundary and teacher-specific UI label.
7. Sign in as an unsupported role; verify Admin and Guardian gates reject the account.
8. Sign out and verify protected pages redirect or show authentication-required state.

## Environment limitation

The Codespace development setup currently uses local Firestore/Functions emulators while browser authentication uses the production Firebase Auth session. Because of that mixed setup, full local Auth role-account mutation testing should be performed only after the Auth emulator is connected or against a controlled staging environment. Static/code-level authorization has been reviewed; this document does not claim that a live end-to-end role test was executed in the current environment.
