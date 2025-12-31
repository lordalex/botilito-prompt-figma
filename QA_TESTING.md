# Botilito QA Testing Guide

## Feature-Specific QA Guides

| Feature | Document |
|---------|----------|
| **Análisis IA** | [docs/QA_ANALISIS_IA.md](docs/QA_ANALISIS_IA.md) |

---

## Test Credentials

### Existing Account (for login/feature testing)
- **Email:** la@lordalexand.co
- **Password:** 12345678

### New Account Creation (for registration testing)
- **Email Pattern:** la+{i}@lordalexand.co
- **Password:** 12345678
- Increment `{i}` for each new test account needed:
  - la+1@lordalexand.co
  - la+2@lordalexand.co
  - la+3@lordalexand.co
  - etc.

---

## Testing Procedures

### 1. Authentication Testing

#### Login Flow
1. Navigate to http://localhost:3000
2. Enter existing account credentials
3. Click "¡Pa' dentro!"
4. Verify redirect to main app or profile completion

#### Registration Flow
1. Navigate to http://localhost:3000
2. Click "Regístrate ahora"
3. Use next available la+{i}@lordalexand.co email
4. Complete registration form
5. Verify account creation and auto-login

#### Session Persistence
1. Login with existing account
2. Close browser/tab
3. Reopen http://localhost:3000
4. Verify session is restored (no login required)

#### Logout Flow
1. While logged in, click logout
2. Verify redirect to login screen
3. Verify session is cleared

#### Invalid Session Handling
1. Clear localStorage manually or use expired token
2. Refresh page
3. Verify app shows login screen (not stuck on "Cargando...")

### 2. Profile Testing

#### Profile Completion
1. Login with account that has incomplete profile
2. Verify profile completion prompt appears
3. Complete profile fields
4. Verify access to main app after completion

### 3. Feature Testing

#### Content Upload
- Test URL detection
- Test text content detection
- Verify textarea auto-expansion

#### Content Review
- Test review queue loading
- Test review actions

#### AI Analysis
- Test analysis submission
- Test results display

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Stuck on "Cargando..." | Invalid refresh token | Clear localStorage, refresh page |
| Login fails | Wrong credentials | Verify email/password |
| Registration fails | Email already exists | Use next increment (la+{i+1}@...) |

---

## Environment

- **Dev Server:** http://localhost:3000
- **Supabase Project:** mdkswlgcqsmgfmcuorxq

---

## Notes

- Track which la+{i} numbers have been used to avoid conflicts
- Last used increment: ___(update as needed)___
- **For AI Analysis testing:** Ask the user to input links manually
- **For everything else:** Automate with Playwright (login, registration, navigation, etc.)
