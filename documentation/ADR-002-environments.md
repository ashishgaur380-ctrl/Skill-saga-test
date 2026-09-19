# ADR-002: Environment Separation

Skill Saga 2.0 uses three isolated environments:

- Development — local and active feature work
- Staging — integration, security and release testing
- Production — real users and production data

Rules:
- No production credentials in source control.
- No experimental schema or rules changes directly in production.
- Production deployments require a tested release.
- Environment-specific configuration is injected at deployment time.
