# Runtime configuration policy
- Theme and language are browser preferences and may live in localStorage.
- The API base URL is public and configurable from a single runtime module.
- Browser overrides are restricted to HTTPS hosts inside babiesiq.tech to prevent token exfiltration.
- Never store session tokens, Google client secrets, Brevo API keys, or passwords in localStorage.
- Session cookies should be HttpOnly, Secure, SameSite, server-issued and server-validated.
- The backend must independently authorize every request; Origin/CORS alone is not authentication.
- Existing SDK pages must be migrated to apiClient before calling the frontend fully integrated.
