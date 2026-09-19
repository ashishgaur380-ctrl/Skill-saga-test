# Phase 2 - Authentication and Authorization

Firebase Authentication provides identity.

Platform roles use Firebase custom claims and server-side authorization.

Roles: super_admin, admin, content_manager, moderator, support, finance, school_admin, teacher, parent, learner.

Role assignment: privileged backend validates the request, sets the custom claim, and the client refreshes its ID token.

Client-side role state is never trusted.

Real Firebase Admin SDK role assignment begins after the Development Firebase project is connected.
