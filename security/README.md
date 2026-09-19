# Security Architecture

Security is designed before feature implementation.

Required controls:
- Firebase Authentication
- Role-based access control
- Firestore Security Rules
- Server-side validation
- Cloud Functions for authoritative operations
- Audit logs
- Rate limiting
- Abuse detection
- Least-privilege service access

Never trust the client for:
- scores
- XP
- coins
- rewards
- rankings
- premium entitlements
- payment state
