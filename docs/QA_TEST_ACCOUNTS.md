# Botilito QA Test Accounts

> **CONFIDENTIAL** - This document contains test credentials for QA purposes only.
> Do not commit to public repositories or share externally.

---

## Test Accounts

### Admin Account
| Field | Value |
|-------|-------|
| **Email** | `la@lordalexand.co` |
| **Password** | `12345678` |
| **Role** | Admin |
| **Notes** | Primary admin account for testing |

---

## Testing Environment

### Local Development
- **URL:** `http://localhost:3008`
- **Alternate ports:** `3009`, `3010` (if 3008 is occupied)

### Supabase Project
- **Project URL:** `https://mdkswlgcqsmgfmcuorxq.supabase.co`
- **Project ID:** `mdkswlgcqsmgfmcuorxq`

---

## Testing Preferences

- **Browser:** Safari (WebKit) - User preference for all testing
- **Playwright:** Use WebKit engine when automated testing

---

## QA Checklist

### Authentication Flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Logout functionality
- [ ] Session persistence (refresh page)
- [ ] Password reset flow

### Main Features
- [ ] Content upload (URL)
- [ ] Content upload (Text)
- [ ] Content upload (File attachment)
- [ ] AI Analysis tab
- [ ] Human Verification tab
- [ ] Immunization Studio
- [ ] Mapa Desinfodémico
- [ ] User Profile

---

## Known Issues

1. **Logout Error:** The logout function has a binding issue in `AuthProvider.tsx` at line 113.
   - **Current:** `signOut: supabase.auth.signOut`
   - **Should be:** `signOut: () => supabase.auth.signOut()`
   - Workaround: Clear localStorage/sessionStorage manually

---

## Last Updated
- **Date:** 2025-12-15
- **Updated by:** Claude Code (QA session)
