# Authentication flow

## Registration

1. `POST /auth/signup` normalizes the email, creates or updates an unverified local user, and sends a 10-minute registration OTP.
2. `POST /auth/verify-signup` validates the newest unused OTP. The OTP claim and `User.isVerified = true` update run in one MongoDB transaction. A token is returned only after the transaction commits.
3. The frontend requires both `user.isVerified === true` and a token before navigating home.

## Login for an unverified account

`POST /auth/login` returns `requiresOtp: true` only when the password account is unverified. It also sends a new registration OTP. The frontend routes to `/verify-otp`, and successful verification logs the user in with the returned token.

## Session restoration

On startup, `AuthContext` calls `GET /auth/me`. Both `/auth/me` and token responses include `isVerified`, and the value is stored in the global auth state and browser storage.

## Environment checks

- The frontend API URL must point to the backend serving the deployed frontend.
- Backend startup logs the MongoDB host and database name (never the full credential-bearing URI).
- When diagnosing a mismatch, compare the browser request host, backend log email, backend MongoDB database name, and the normalized lowercase email in MongoDB.

## OTP safeguards

Registration OTP verification and resend endpoints are rate-limited. OTPs expire after 10 minutes, are single-use, and cannot be claimed twice concurrently.
