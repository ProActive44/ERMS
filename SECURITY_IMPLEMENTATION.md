# Security Implementation: Secure Refresh Token Handling

## Overview
Implemented industry-standard secure refresh token handling using httpOnly cookies, token rotation, and token reuse detection to protect against XSS, CSRF, and token theft attacks.

## Security Features Implemented

### 1. **httpOnly Cookies for Refresh Tokens**
- **Protection**: XSS (Cross-Site Scripting) attacks
- **Implementation**: Refresh tokens are stored in httpOnly cookies, making them inaccessible to JavaScript
- **Location**: `backend/src/controllers/authController.ts`
```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### 2. **Token Hashing in Database**
- **Protection**: Database compromise
- **Implementation**: Refresh tokens are hashed using SHA-256 before storage
- **Location**: `backend/src/utils/jwt.ts`
```typescript
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

### 3. **Token Rotation**
- **Protection**: Replay attacks
- **Implementation**: Each token refresh generates a new token and invalidates the old one
- **Location**: `backend/src/controllers/authController.ts` (refreshToken endpoint)
- **Behavior**: Old token is removed from database, new token is generated

### 4. **Token Reuse Detection**
- **Protection**: Token theft exploitation
- **Implementation**: If a revoked token is used, all user sessions are terminated
- **Location**: `backend/src/controllers/authController.ts` (refreshToken endpoint)
- **Behavior**: Detects security breach and revokes all refresh tokens for the user

### 5. **Session Limiting**
- **Protection**: Resource exhaustion
- **Implementation**: Maximum 5 concurrent sessions per user
- **Location**: `backend/src/controllers/authController.ts` (register/login endpoints)
- **Behavior**: Oldest session is automatically removed when limit is reached

### 6. **CSRF Protection**
- **Protection**: Cross-Site Request Forgery
- **Implementation**: `sameSite: 'strict'` cookie attribute
- **Behavior**: Browser only sends cookie with same-site requests

### 7. **Secure Token Transmission**
- **Protection**: Man-in-the-middle attacks
- **Implementation**: `secure: true` flag in production (HTTPS only)
- **Behavior**: Cookie only transmitted over encrypted connections

## Architecture Changes

### Backend Changes

#### User Model (`backend/src/models/User.ts`)
```typescript
interface IUser {
  // ... existing fields
  refreshTokens: string[]; // Array of hashed refresh tokens
}
```

#### JWT Utils (`backend/src/utils/jwt.ts`)
- Added `hashToken()` function for SHA-256 hashing
- Modified `generateTokens()` to include unique `tokenId` in refresh tokens

#### Auth Controller (`backend/src/controllers/authController.ts`)
- **register**: Sets httpOnly cookie, stores hashed token, limits sessions
- **login**: Same security measures as register
- **refreshToken**: Cookie-based, token rotation, reuse detection
- **logout**: Revokes specific token and clears cookie

#### Server Configuration (`backend/src/server.ts`)
- Added `cookie-parser` middleware
- CORS configured with `credentials: true`

### Frontend Changes

#### Axios Configuration (`frontend/src/api/axios.ts`)
- Added `withCredentials: true` to send cookies automatically
- Modified interceptor to work with cookie-based refresh
- Removed localStorage refresh token logic

#### Auth API (`frontend/src/api/authApi.ts`)
- Removed `refreshToken` from `AuthResponse` interface
- Updated `refreshToken()` method to not send token in body
- Added `logout()` method to call backend logout endpoint

#### Auth Store (`frontend/src/store/authSlice.ts`)
- Removed `refreshToken` from state
- Removed all localStorage operations for refresh token
- Added `logoutUser` async thunk to call backend logout

#### Components (`frontend/src/components/Navbar.tsx`)
- Updated logout handler to call `logoutUser()` async thunk

## Security Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Token Storage | localStorage (XSS vulnerable) | httpOnly cookie (XSS protected) |
| Database Storage | Plain text tokens | SHA-256 hashed tokens |
| Token Lifetime | No rotation | Rotates on each refresh |
| Token Revocation | Not possible | Immediate revocation |
| Attack Detection | None | Revokes all sessions on reuse |
| Session Limit | Unlimited | Maximum 5 sessions |
| CSRF Protection | None | sameSite: strict |
| HTTPS Enforcement | No | Yes (production) |

## Token Flow

### Login/Register Flow
1. User provides credentials
2. Backend validates and generates tokens
3. Access token sent in response body
4. Refresh token sent in httpOnly cookie
5. Hashed refresh token stored in database
6. Frontend stores access token in localStorage
7. Frontend receives cookie automatically (not in code)

### Token Refresh Flow
1. Access token expires (15 minutes)
2. Frontend makes request, receives 401
3. Axios interceptor triggers refresh request
4. Browser automatically sends refresh token cookie
5. Backend verifies token exists in database
6. Backend detects if token was previously used (revoked)
   - If reused: Revoke all user tokens (security breach)
   - If valid: Generate new tokens
7. Backend removes old hashed token from database
8. Backend adds new hashed token to database
9. Backend sends new refresh token in cookie
10. Backend sends new access token in response
11. Frontend updates access token in localStorage
12. Frontend retries failed requests

### Logout Flow
1. User clicks logout
2. Frontend calls `/auth/logout` endpoint
3. Backend removes refresh token from database
4. Backend clears refresh token cookie
5. Frontend removes access token from localStorage
6. Frontend redirects to login page

## Testing Checklist

- [ ] Login successfully and verify cookie is set
- [ ] Make authenticated requests with access token
- [ ] Wait for access token to expire and verify automatic refresh
- [ ] Logout and verify cookie is cleared
- [ ] Try to use revoked token (should fail)
- [ ] Login 6 times and verify oldest session is removed
- [ ] Test token reuse detection (use old token after refresh)
- [ ] Verify HTTPS-only in production

## Environment Variables

Ensure these are set in backend `.env`:
```
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
NODE_ENV=production  # For secure cookies
```

## Dependencies Added

Backend:
```json
{
  "cookie-parser": "^1.4.7",
  "@types/cookie-parser": "^1.4.7"
}
```

## Security Best Practices Followed

1. ✅ **Defense in Depth**: Multiple layers of security (cookies + hashing + rotation + detection)
2. ✅ **Principle of Least Privilege**: Refresh tokens only accessible by server
3. ✅ **Zero Trust**: Every token usage is verified against database
4. ✅ **Fail Secure**: Security breach triggers full account lockout
5. ✅ **Secure by Default**: httpOnly, secure, sameSite flags enabled
6. ✅ **Token Hygiene**: Regular rotation and revocation capabilities

## Known Limitations

1. **Subdomain Sharing**: Current `sameSite: strict` prevents subdomain sharing
   - Solution: Use `sameSite: 'lax'` if needed, but increases CSRF risk
2. **Mobile Apps**: httpOnly cookies don't work with mobile apps
   - Solution: Use different auth strategy for mobile (e.g., secure storage)
3. **Cookie Size**: Cookies are limited to 4KB
   - Current: Not an issue (JWT tokens are ~200-400 bytes)

## Future Improvements

1. **Refresh Token Families**: Track token lineage for better breach detection
2. **Geolocation Tracking**: Alert users of logins from new locations
3. **Device Fingerprinting**: Detect suspicious device changes
4. **Rate Limiting**: Limit refresh attempts per session
5. **Refresh Token TTL**: Add created timestamp and enforce maximum lifetime

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
