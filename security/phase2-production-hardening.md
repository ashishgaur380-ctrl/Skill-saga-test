# Phase 2 Production Hardening

- Keep Firebase service-account credentials only in GitHub Actions secrets.
- Firestore client writes remain denied by default.
- Learning-material Storage writes require an authorized content-management role.
- Quiz and competition scoring remains server-authoritative.
- Published delivery enforces active and publish/expiry windows.
- Run authenticated admin, learner and guardian smoke tests before production release.
- Verify Firebase Auth providers, authorized domains, Storage and Firestore deployment.
