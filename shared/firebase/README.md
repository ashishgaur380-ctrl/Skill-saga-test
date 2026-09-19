# Firebase Service Boundary

Firebase configuration is environment-driven. No project IDs, API keys, or credentials are committed.

Client apps may initialize Firebase Authentication/Firestore from this boundary. Privileged writes belong to the backend/Admin SDK.
