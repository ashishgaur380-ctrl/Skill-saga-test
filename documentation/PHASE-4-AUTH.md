# Phase 4 - Admin Authentication

The Admin Console uses Firebase Authentication for identity and Firebase custom claims for authorization.

## Login flow
1. Admin submits credentials.
2. Firebase Authentication verifies identity.
3. Backend/session layer verifies the Firebase ID token.
4. The user's `role` custom claim is checked.
5. Only approved administrative roles access Admin Console modules.

Allowed initial Admin roles:
- `super_admin`
- `admin`
- `content_manager`

## Security rule
Never authorize an Admin based only on localStorage, URL parameters, hidden UI, or client-side role state.

## Current status
The UI and route-guard boundary are scaffolded. Real Firebase login/session verification remains disabled until the Development Firebase project is connected.
