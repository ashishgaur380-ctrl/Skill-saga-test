# Firebase Development Project

Skill Saga 2.0 Development Firebase project:

- Project name: skill saga 20
- Project ID: skill-saga-2
- Plan: Spark
- Web app: Skill Saga 2.0 Web

## Configuration

Firebase Web configuration is supplied through environment variables. Do not commit `.env.local`, service-account JSON, private keys, or other credentials.

Required variables:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## Services

Authentication and Firestore will be enabled next. Storage and Cloud Functions will be added when their modules are implemented.

## Security

The Web API key is not treated as an authorization secret. Authorization is enforced by Firebase Auth, custom claims, Firestore rules, and server-side services. Never commit service-account private keys.
