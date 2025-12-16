# Security Audit Report - Botilito Platform

**Date:** 2025-12-16
**Auditor:** Claude (Automated Security Audit)
**Application:** Botilito - Anti-misinformation platform
**Version:** 0.1.0
**Severity Levels:** CRITICAL | HIGH | MEDIUM | LOW | INFORMATIONAL

---

## Executive Summary

This security audit reviewed the Botilito platform, a React-based anti-misinformation application using Supabase for authentication and backend services. The audit identified several security concerns ranging from medium to informational severity. **No critical vulnerabilities were found**, but several improvements are recommended.

### Summary of Findings

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | - |
| High | 1 | Requires attention |
| Medium | 4 | Should be addressed |
| Low | 3 | Recommended improvements |
| Informational | 4 | Best practices |

---

## Findings

### HIGH SEVERITY

#### 1. [HIGH] CORS Wildcard Configuration

**Location:** `supabase/functions/profile/index.ts:13`, `src/utils/errorManager/ErrorManager.ts:311`

**Issue:** The CORS headers are configured with `Access-Control-Allow-Origin: '*'` which allows any origin to make requests to the API.

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // VULNERABLE
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Risk:** While Supabase Edge Functions require authentication via JWT, the wildcard CORS policy could allow:
- Cross-site request scenarios from malicious origins
- Potential token leakage in certain attack scenarios
- Reduced defense-in-depth

**Recommendation:**
- Replace wildcard with specific allowed origins:
```typescript
const allowedOrigins = [
  'https://digitalia.gov.co',
  'https://www.digitalia.gov.co',
  process.env.VITE_APP_URL
];
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
  // ...
};
```

---

### MEDIUM SEVERITY

#### 2. [MEDIUM] Supabase Anonymous Key Exposed in Non-Protected File

**Location:** `src/utils/supabase/info.tsx:3-4`, `output.txt:683`

**Issue:** The Supabase anonymous key and project ID are stored in version-controlled files:

```typescript
export const projectId = "phgepmotxdpicyuzksqc"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Risk:**
- The anonymous key is intentionally public (by Supabase design), but storing it in code makes rotation difficult
- The `output.txt` file appears to be a debug/development artifact containing sensitive configuration
- Multiple different Supabase project references exist (`mdkswlgcqsmgfmcuorxq` vs `phgepmotxdpicyuzksqc`)

**Recommendation:**
1. Remove `output.txt` from version control (add to `.gitignore`)
2. Use only environment variables for Supabase configuration
3. Clarify which Supabase project is canonical
4. Consider adding `output.txt`, `outbasefigma.txt`, and `o.txt` to `.gitignore`

---

#### 3. [MEDIUM] Vite Security Vulnerabilities in Dependencies

**Location:** `package.json` (vite: 6.3.5)

**Issue:** The npm audit reveals moderate severity vulnerabilities in Vite:
- **GHSA-g4jq-h2w9-997c**: Middleware may serve files starting with the same name as public directory
- **GHSA-jqfw-vq24-v9c3**: `server.fs` settings not applied to HTML files
- **GHSA-93m4-6634-74q7**: `server.fs.deny` bypass via backslash on Windows

**Recommendation:**
```bash
npm audit fix --force
# Or manually update vite to 6.4.1+
npm install vite@latest --save-dev
```

---

#### 4. [MEDIUM] Weak Password Policy

**Location:** `src/components/Register.tsx:59-62`

**Issue:** The password validation only requires 6 characters minimum with no complexity requirements:

```typescript
if (credentials.password.length < 6) {
  setError('La contraseña debe tener al menos 6 caracteres');
  return;
}
```

**Risk:** Weak passwords increase vulnerability to brute force attacks.

**Recommendation:**
Implement stronger password requirements:
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
if (!passwordRegex.test(credentials.password)) {
  setError('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números');
  return;
}
```

---

#### 5. [MEDIUM] Potential IDOR in Profile API

**Location:** `supabase/functions/profile/index.ts:62-82`

**Issue:** The GET endpoint allows any authenticated user to fetch any other user's profile by ID:

```typescript
if (req.method === 'GET') {
  const user = await getAuthenticatedUser(req);
  const url = new URL(req.url);
  const targetUserId = url.searchParams.get('id') || user.id;  // Can fetch any user's profile
  // ...
}
```

**Risk:** Insecure Direct Object Reference (IDOR) - authenticated users can potentially enumerate and view other users' profiles.

**Recommendation:**
If fetching other users' profiles is not a feature requirement:
```typescript
// Only allow users to fetch their own profile
const targetUserId = user.id;
```

If viewing other profiles is intended, implement access controls.

---

### LOW SEVERITY

#### 6. [LOW] Development Server Bound to All Interfaces

**Location:** `vite.config.ts:64-66`

**Issue:** The development server is configured to listen on all network interfaces:

```typescript
server: {
  allowedHosts: ['.digitalia.gov.co'],
  host: '0.0.0.0',  // Binds to all interfaces
  port: 3000,
}
```

**Risk:** The development server could be accessible from the local network during development.

**Recommendation:**
For development, use localhost binding unless network access is required:
```typescript
host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
```

---

#### 7. [LOW] Console Logging of Sensitive Information

**Location:** Multiple files

**Issue:** Several files log potentially sensitive information to the console:
- `src/utils/historial/api.ts:32-33` - Logs case details
- `src/components/Login.tsx:38` - Logs full error objects
- Various components log session and user data

**Recommendation:**
1. Remove or gate console.log statements behind development mode
2. Avoid logging full error objects in production
3. Use a structured logging library with log levels

---

#### 8. [LOW] Missing Content Security Policy Headers

**Location:** `index.html`

**Issue:** No Content Security Policy (CSP) headers are configured, leaving the application more vulnerable to XSS attacks if other vulnerabilities exist.

**Recommendation:**
Add CSP meta tag to `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' https: data:;
               connect-src 'self' https://*.supabase.co;">
```

---

### INFORMATIONAL

#### 9. [INFO] dangerouslySetInnerHTML Usage

**Location:** `src/components/ui/chart.tsx:83-101`

**Finding:** The use of `dangerouslySetInnerHTML` was identified but is **NOT a vulnerability** in this case:
- Used only for CSS style injection
- Values derived from component configuration, not user input
- Standard pattern for chart styling libraries

**Status:** No action required.

---

#### 10. [INFO] LocalStorage for Non-Sensitive Data

**Location:** Multiple providers

**Finding:** LocalStorage is used for:
- Job tracking (`botilito-job-manager`)
- Vote tracking (`botilito-vote-jobs`)
- Analysis jobs (`figma-design-analysis-jobs`)

**Status:** This is acceptable as the data stored is not sensitive (only job IDs and status). Session tokens are managed by Supabase's secure storage.

---

#### 11. [INFO] Debug/Development Files in Repository

**Location:** Root directory

**Finding:** Several development artifacts should be excluded from version control:
- `output.txt` - Contains compiled code with embedded keys
- `outbasefigma.txt` - Development output
- `o.txt` - Development output
- `d.sh` - Development script
- `patch.sh` - Patch script

**Recommendation:** Add to `.gitignore`:
```
output.txt
outbasefigma.txt
o.txt
d.sh
patch.sh
*.orig
*.rej
```

---

#### 12. [INFO] Multiple Supabase Project References

**Location:** Various API files

**Finding:** Two different Supabase project IDs are referenced:
1. `mdkswlgcqsmgfmcuorxq` (used in API endpoints)
2. `phgepmotxdpicyuzksqc` (in info.tsx)

**Recommendation:** Consolidate to use a single Supabase project or document if multiple projects are intentional.

---

## Security Strengths

The application demonstrates several security best practices:

1. **Authentication Implementation**
   - Uses Supabase Auth with JWT tokens
   - Session persistence with automatic token refresh
   - Auth state managed centrally via AuthProvider

2. **API Security**
   - All sensitive API endpoints require authentication
   - Bearer tokens included in API requests
   - Session validation before API calls

3. **Profile Update Whitelist**
   - Profile API uses a whitelist approach for allowed fields:
   ```typescript
   const allowedFields = ['nombre_completo', 'numero_telefono', 'departamento', 'ciudad', 'fecha_nacimiento'];
   ```
   - Prevents modification of sensitive fields (id, email, role)

4. **XSS Prevention**
   - React's default escaping prevents most XSS vectors
   - No unsafe user content rendering detected
   - No `eval()` or `new Function()` usage

5. **No SQL Injection Vectors**
   - Uses Supabase client with parameterized queries
   - No raw SQL execution in frontend code

---

## Remediation Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Update Vite to fix vulnerabilities | Low |
| 2 | Implement specific CORS origins | Medium |
| 3 | Remove debug files from repo | Low |
| 4 | Strengthen password policy | Low |
| 5 | Fix IDOR in profile API | Low |
| 6 | Add CSP headers | Medium |
| 7 | Clean up console logging | Low |

---

## Conclusion

The Botilito platform has a **solid security foundation** with proper authentication, input handling, and API security. The identified issues are primarily configuration improvements rather than critical vulnerabilities.

**Immediate actions recommended:**
1. Run `npm audit fix` to address Vite vulnerabilities
2. Remove development artifacts from version control
3. Implement specific CORS origins for production

**For production deployment:**
1. Ensure all environment variables are properly configured
2. Enable Supabase Row Level Security (RLS) policies
3. Add Content Security Policy headers
4. Review and strengthen password requirements

---

*Report generated by automated security audit. Manual penetration testing recommended before production deployment.*
