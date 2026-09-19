# Database Schema

This directory will contain the versioned Firestore schema and data contracts.

## Rules
- IDs are immutable.
- References use stable document IDs.
- Client-writable fields are explicitly allowlisted.
- Sensitive calculations are server-authoritative.
- Schema changes require documentation and migration notes.
- Production changes are never tested directly from development.

## Initial domains
identity, academic, content, questions, assessment, competition, community, rewards, business, automation, notifications, system.
