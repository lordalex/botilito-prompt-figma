# Botilito - QA Testing Documentation

**CONFIDENTIAL - LOCAL ONLY**
This file contains sensitive testing credentials and should never be committed to the repository.

---

## 🚀 Quick Reference

**Test Focus**: Análisis IA (AI Analysis) Feature Only
**Test Type**: Automated Frontend Testing
**Duration**: ~15-20 seconds
**Pass Criteria**: Frontend UI/UX fully functional (backend may not be configured)

---

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Test Credentials](#test-credentials)
3. [Test Data Sources](#test-data-sources)
4. [Executable Test Script](#executable-test-script)
5. [Pass/Fail Criteria](#passfail-criteria)
6. [Known Issues & Workarounds](#known-issues--workarounds)
7. [Test Report Template](#test-report-template)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Environment Setup

### Server Configuration

**⚠️ IMPORTANT**: Dev server port may vary!

```bash
# Check dev server output for actual port:
npm run dev

# Common ports (in order of preference):
# ✅ http://localhost:3000/
# ✅ http://localhost:5173/ (Vite default)
# ✅ http://localhost:5174/ (if 5173 in use)
# ✅ Check terminal output for actual port
```

**For Testing**:
- Always check the terminal output after `npm run dev`
- Look for: `➜  Local:   http://localhost:XXXX/`
- Use the actual port number shown in terminal
- Update test URL dynamically based on server output

### Screenshot Directory

**All test screenshots must be saved to**:
```
./qa-reports/YYYY-MM-DD-HHMM/
```

**Directory Structure**:
```
qa-reports/
├── 2025-11-15-1430/
│   ├── 01-initial-state.png
│   ├── 02-dashboard-loaded.png
│   ├── 03-form-empty-state.png
│   ├── 04-url-entered.png
│   ├── 05-loading-state-1.png
│   ├── 06-loading-state-2.png
│   ├── 07-error-state.png
│   ├── 08-error-detail.png
│   └── test-report.md
├── 2025-11-15-1500/
│   └── ...
```

**Create directory before test**:
```bash
mkdir -p qa-reports/$(date +%Y-%m-%d-%H%M)
```

---

## 🔑 Test Credentials

### Login Account
- **Email**: `la@lordalexand.co`
- **Password**: `12345678`
- **Purpose**: Primary test account for QA and feature testing

### Browser Automation Settings

**Handle Popups/Dialogs**:
- Password save prompts: DISMISS/IGNORE
- Weak password warnings: DISMISS/IGNORE
- Browser notifications: BLOCK
- Autocomplete suggestions: IGNORE

**Playwright Configuration**:
```javascript
// These settings help avoid popup interruptions:
context.setDefaultTimeout(30000);
// Don't save credentials
context.addInitScript(() => {
  Object.defineProperty(navigator, 'credentials', {
    get: () => undefined
  });
});
```

---

## 📊 Test Data Sources

### AI Analysis Content Testing

#### Primary Source
- **URL**: https://elpais.com/america/
- **Name**: El País América
- **Purpose**: Source for news articles to test AI Analysis

#### Test URLs

**Primary Test URL** (Verified Working):
```
https://elpais.com/america/colombia/2024-11-15/petro-anuncia-cambios-en-su-gabinete.html
```

**Alternate Test URLs** (If primary fails):
```
https://elpais.com/internacional/
https://elpais.com/america/mexico/
https://elpais.com/opinion/
```

**URL Characteristics**:
- Length: ~80-100 characters
- Expected character count: 88 for primary URL
- Content type: Political/News article

---

## 🤖 Executable Test Script

### PRE-TEST: Environment Check

```markdown
**BEFORE STARTING TEST**:

1. ✅ Check dev server is running
2. ✅ Note the actual port from terminal output
3. ✅ Create screenshot directory: `qa-reports/$(date +%Y-%m-%d-%H%M)/`
4. ✅ Set screenshot path in test variables
5. ✅ Clear browser cache/cookies (optional but recommended)
```

---

### STEP 0: Determine Server URL

**Action**: Read dev server output or check browser output tool

**Expected Output Pattern**:
```
➜  Local:   http://localhost:XXXX/
```

**Variable Assignment**:
```
SERVER_URL = "http://localhost:{PORT}/"  // Use actual port from output
SCREENSHOT_DIR = "qa-reports/{TIMESTAMP}/"
TEST_URL = "https://elpais.com/america/colombia/2024-11-15/petro-anuncia-cambios-en-su-gabinete.html"
```

---

### STEP 1: Navigate and Verify Login State

**Action**:
```javascript
browser_navigate(SERVER_URL)
wait(2)  // Allow page to fully load
```

**Expected DOM States**:

**Option A - Logged Out**:
- Login form visible
- Email input field present (placeholder: "usuario@ejemplo.com")
- Password input field present (placeholder: "••••••••")
- "¡Pa' dentro!" button present
- Botilito character image on left side

**Option B - Logged In (Session Persisted)**:
- Dashboard visible
- Navigation tabs present
- User profile visible (look for "DMG" or "Dr. María González")
- "Análisis IA" tab active (yellow/highlighted)

**Verification Checklist**:
- ✅ Page title = "Botilito"
- ✅ Page URL = SERVER_URL
- ✅ No critical JavaScript errors (404s acceptable)
- ✅ Botilito logo/character visible

**Handle Popups**:
```javascript
// If password save dialog appears
if (passwordSaveDialog) {
  dismiss() or press('Escape')
}
```

**Screenshot**: `{SCREENSHOT_DIR}/01-initial-state.png`

**Pass Criteria**:
- Page loads successfully within 5 seconds
- Either login form OR dashboard is visible
- No white screen/crash

**On Failure**:
- Check if server is running
- Verify port number is correct
- Check browser console for errors

---

### STEP 2: Authentication (Conditional)

**Condition**: Only if login form is visible (not already logged in)

**Action**:
```javascript
if (isLoginPage) {
  type(emailField, "la@lordalexand.co")
  type(passwordField, "12345678")
  click(loginButton: "¡Pa' dentro!")

  // Handle potential browser popups
  wait(1)
  if (passwordWeakWarning) {
    dismiss() or press('Escape')
  }
  if (savePasswordDialog) {
    click('Never' or 'Not Now') or press('Escape')
  }

  wait(2)  // Allow dashboard to load
}
```

**Expected Result**:
- Page transitions to dashboard
- URL remains: SERVER_URL
- Navigation bar appears with tabs:
  - Análisis IA
  - Diagnóstico Humano
  - Inmunización
  - Historial
  - Mapa Desinfodémico
  - Mi Perfil
- User profile shows in top right
- Notification badge visible (number may vary)

**Verification Checklist**:
- ✅ No login form visible anymore
- ✅ Navigation tabs present
- ✅ "Análisis IA" tab is active/highlighted
- ✅ User avatar/name visible
- ✅ Botilito logo in top left

**Screenshot**: `{SCREENSHOT_DIR}/02-dashboard-loaded.png`

**Pass Criteria**:
- Dashboard loads completely
- No authentication errors
- User session established

**On Failure**:
- Verify credentials are correct
- Check Supabase connection
- Check browser console for auth errors

---

### STEP 3: Verify Análisis IA Form

**Condition**: Should be on "Análisis IA" tab by default

**Expected UI Elements**:

1. **Heading**: "Ajá! ¿listos para diagnosticar juntos lo que se esconde detrás de lo evidente?"

2. **Botilito Card**:
   - Botilito character image (yellow background)
   - Text: "En Digital-IA me incorporaron tecnología para analizar:"
   - 5 capability badges:
     - 🔗 Enlaces
     - 📝 Texto
     - 🖼️ Imágenes
     - 🎥 Videos
     - 🎵 Audios

3. **Content Input Area**:
   - Text: "Arrastra y suelta o pega tu contenido aquí"
   - "Adjuntar archivo" button (with icon)
   - Textarea with placeholder: "Pega aquí una URL, texto sospechoso, o escribe lo que quieras analizar..."
   - Character counter (initially showing "0 caracteres" or similar)

4. **Vector de Transmisión**:
   - Heading with icon: "Vector de Transmisión"
   - Text: "¿Por dónde recibiste este contenido?"
   - Dropdown with default: "Otra plataforma digital"

5. **Submit Button**:
   - "Iniciar Diagnóstico" button
   - Should be DISABLED (grayed out)

**Verification Checklist**:
- ✅ All text in Spanish
- ✅ Botilito character visible
- ✅ All 5 capability badges present
- ✅ Textarea is empty
- ✅ Character counter shows 0 or empty state
- ✅ Button is disabled
- ✅ No validation errors shown

**Screenshot**: `{SCREENSHOT_DIR}/03-form-empty-state.png`

**Pass Criteria**:
- All form elements render correctly
- No missing images or broken layouts
- Button correctly disabled when empty

**On Failure**:
- Check for console errors
- Verify CSS/images loading
- Check network tab for failed resources

---

### STEP 4: Enter Test URL

**Action**:
```javascript
click(textarea)  // Focus on textarea
type(textarea, TEST_URL)
wait(1)  // Allow UI to update
```

**Test URL**:
```
https://elpais.com/america/colombia/2024-11-15/petro-anuncia-cambios-en-su-gabinete.html
```

**Expected Immediate Changes**:
1. Text appears in textarea
2. Character counter updates to "88 caracteres" (or similar count)
3. "Iniciar Diagnóstico" button becomes ENABLED (no longer grayed)
4. No error messages

**Verification Checklist**:
- ✅ URL fully visible in textarea
- ✅ Character count displays (should be ~88)
- ✅ Button is now enabled (clickable, highlighted)
- ✅ No validation errors
- ✅ Textarea height may auto-adjust (stays 1-2 rows for URL)

**Screenshot**: `{SCREENSHOT_DIR}/04-url-entered.png`

**Pass Criteria**:
- Content accepted in textarea
- Character counter working
- Button state changes correctly

**On Failure**:
- Check if textarea is readonly
- Verify button enable logic
- Check for JavaScript errors

---

### STEP 5: Submit Analysis

**Action**:
```javascript
click(button: "Iniciar Diagnóstico")
// Don't wait - screenshot immediately to capture transition
```

**Expected Immediate Response** (< 1 second):
- Page transitions to loading state
- Previous form disappears
- Loading screen appears

**New UI Elements**:
1. **Botilito Image**: Animated "analyzing" version
2. **Heading**: "🔍 Botilito está diagnosticando..."
3. **Subtext**: "Aplicando análisis epidemiológico para detectar patrones de desinformación y evaluar su potencial viral"
4. **Progress Bar**: Animated progress indicator
5. **Status Message**: Initial status text

**Verification Checklist**:
- ✅ Form no longer visible
- ✅ Loading screen displayed
- ✅ Botilito analyzing image shown
- ✅ Progress bar animating
- ✅ Status message present

**Screenshot**: `{SCREENSHOT_DIR}/05-loading-state-1.png` (capture immediately)

**Pass Criteria**:
- Transition happens immediately
- Loading UI is professional and clear
- No errors during submission

**On Failure**:
- Check if button click registered
- Verify form submission logic
- Check network tab for API calls

---

### STEP 6: Monitor Analysis Progress

**Action**:
```javascript
wait(3)  // Allow status to update
screenshot()  // Capture updated state
wait(7)   // Wait for completion or error (total ~10s)
```

**Expected Status Message Progression**:
1. "Secuenciando contenido desinfodémico..."
2. "Identificando vectores de transmisión..."
3. [May have additional states]

**Verification Checklist**:
- ✅ Status message updates (changes over time)
- ✅ Progress bar continues animating
- ✅ No page freeze or hang
- ✅ Botilito stays visible

**Screenshot**: `{SCREENSHOT_DIR}/06-loading-state-2.png` (after 3 seconds)

**Pass Criteria**:
- UI remains responsive
- Status updates visible
- No timeout errors before 10 seconds

---

### STEP 7: Handle Analysis Completion

**After ~10 seconds, one of two outcomes**:

---

#### OUTCOME A: Success (Backend Configured) 🟢

**⚠️ NOTE**: Currently NOT expected - backend not configured

**Expected Elements**:
- Results page appears
- Analysis data displayed
- Classification labels
- AI explanations
- Consensus information
- Related documents (optional)
- Web search results (optional)

**Verification Checklist**:
- ✅ Results render completely
- ✅ Data is readable and formatted
- ✅ No placeholder text
- ✅ All sections have content

**Screenshot**: `{SCREENSHOT_DIR}/07-results-success.png`

**Pass Criteria**: All expected data sections display correctly

---

#### OUTCOME B: Error (Backend Not Configured) 🔴

**⚠️ NOTE**: Currently EXPECTED behavior

**Expected Error Screen**:
1. **Botilito Image**: Sad/error expression (different from analyzing state)
2. **Heading**: "⚠️ ¡Uy, parce! Algo salió mal"
3. **Explanation**: "Parece que mis circuitos tuvieron un cortocircuito. Esto fue lo que pasó:"
4. **Error Message**: "El análisis falló" (in red or highlighted)
5. **Recovery Buttons**:
   - "🔄 Reintentar Análisis"
   - "📝 Analizar Otro Contenido"

**Console Error** (Expected):
```
Error en el servicio de análisis de contenido: Error: El análisis falló
```

**Verification Checklist**:
- ✅ Error screen displays (not blank page)
- ✅ Botilito shows sad expression
- ✅ Error message in Spanish
- ✅ Message is user-friendly (not technical)
- ✅ Two recovery buttons present
- ✅ No app crash or white screen

**Screenshot**: `{SCREENSHOT_DIR}/07-error-state.png`

**Pass Criteria**:
- Error handled gracefully
- User-friendly Spanish message
- Recovery options available
- **THIS IS A PASS** - Frontend correctly handling backend unavailability

**On Failure**:
- If blank screen: Frontend error, not backend
- If English error: Translation missing
- If no recovery options: UX incomplete

---

### STEP 8: Verify Error Details

**Action**:
```javascript
// Capture close-up of error message
screenshot(errorCard)  // Or full page
```

**Check Console**:
- Expected error: `Error en el servicio de análisis de contenido`
- This is ACCEPTABLE and counts as PASS

**Additional Verification**:
- ✅ Buttons are clickable (not disabled)
- ✅ Layout not broken
- ✅ Text is readable
- ✅ Colors/styling appropriate for error state

**Screenshot**: `{SCREENSHOT_DIR}/08-error-detail.png`

**Pass Criteria**:
- Error UI is complete and polished
- Users can recover from error
- No broken UI elements

---

## ✅ Pass/Fail Criteria

### Overall Test Result: PASS if ALL these conditions met

#### Critical (Must Pass):
1. ✅ Server accessible at correct port
2. ✅ Page loads without crash
3. ✅ Login successful (or session persisted)
4. ✅ Dashboard renders completely
5. ✅ Form displays all elements
6. ✅ URL input accepted
7. ✅ Character counter functional
8. ✅ Button enables with content
9. ✅ Submit triggers loading state
10. ✅ Error handled gracefully (if backend down)

#### Secondary (Important but not critical):
- Images load correctly
- Animations smooth
- Spanish language throughout
- No broken layouts
- Recovery options work

### Console Errors - Classification

#### ✅ Acceptable (Don't Fail Test):
```
- "Failed to load resource: 404" (favicon, etc.)
- "Error en el servicio de análisis de contenido: Error: El análisis falló"
- Vite HMR messages
- React DevTools suggestions
```

#### ❌ Unacceptable (Fail Test):
```
- "Cannot read property 'X' of undefined"
- "TypeError" or "ReferenceError"
- "Failed to fetch" (if credentials correct)
- CORS errors
- React component errors
- Supabase auth failures (with correct credentials)
```

---

## ⚠️ Known Issues & Workarounds

### Issue 1: Backend AI Service Not Configured

**Status**: ✅ EXPECTED BEHAVIOR
**Severity**: Low (for frontend testing)

**Symptom**:
- Analysis always fails with "El análisis falló"
- Console shows service error

**Workaround**:
- This is normal and expected
- Frontend correctly handles the error
- Test passes if error is shown gracefully

**Resolution**:
- Configure backend services (not required for frontend test)
- Add API keys to `.env`
- Deploy Supabase Edge Functions

---

### Issue 2: Browser Password Save Dialogs

**Status**: ⚠️ INTERMITTENT
**Severity**: Low (doesn't affect test)

**Symptom**:
- Browser asks to save password
- Weak password warning appears

**Workaround**:
```javascript
// Immediately after login
if (dialog appears) {
  press('Escape') or click('Never') or click('Not Now')
}
wait(1)  // Allow dialog to dismiss
```

**Prevention**:
- Use private/incognito mode
- Disable password manager in test browser
- Set Playwright to handle dialogs automatically

---

### Issue 3: Port Number Varies

**Status**: ✅ EXPECTED
**Severity**: Medium (breaks test if hardcoded)

**Symptom**:
- Server runs on 5173, 5174, 3000, 3001, etc.
- Hardcoded port causes navigation failure

**Workaround**:
```javascript
// Always check server output first
const serverOutput = await bashOutput('npm run dev')
const portMatch = serverOutput.match(/localhost:(\d+)/)
const PORT = portMatch ? portMatch[1] : '3000'
const SERVER_URL = `http://localhost:${PORT}/`
```

**Prevention**:
- Never hardcode port
- Read from server output
- Document actual port in test report

---

### Issue 4: Session Persistence

**Status**: ✅ FEATURE
**Severity**: None (helps testing)

**Symptom**:
- Already logged in on subsequent tests
- Login step skipped

**Workaround**:
```javascript
// Detect logged-in state
if (dashboardVisible) {
  // Skip login, proceed to Step 3
} else {
  // Perform login (Step 2)
}
```

**Note**: This is actually helpful for faster test iterations!

---

## 📝 Test Report Template

### Test Execution Report

```markdown
# Botilito QA Test Report

**Test Date**: YYYY-MM-DD HH:MM
**Test Type**: Automated Frontend - Análisis IA
**Tester**: Claude Code
**Duration**: XX seconds

---

## Environment

- **Server URL**: http://localhost:XXXX/
- **Branch**: main
- **Commit**: [hash]
- **Node Version**: vX.X.X
- **Browser**: Chromium (Playwright)

---

## Test Results Summary

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 0 | Determine Port | Read from output | Port XXXX | ✅ PASS |
| 1 | Navigate | Page loads | Page loaded | ✅ PASS |
| 2 | Authenticate | Login/Dashboard | Dashboard shown | ✅ PASS |
| 3 | Verify Form | All elements | All present | ✅ PASS |
| 4 | Enter URL | Button enables | Enabled (88 chars) | ✅ PASS |
| 5 | Submit | Loading screen | Shown immediately | ✅ PASS |
| 6 | Progress | Status updates | Updated 2x | ✅ PASS |
| 7 | Completion | Error/Results | Error displayed | ✅ PASS |
| 8 | Error UX | Friendly message | Spanish, friendly | ✅ PASS |

**Overall Result**: ✅ **PASS** (Frontend Fully Functional)

---

## Screenshots

All screenshots saved to: `qa-reports/YYYY-MM-DD-HHMM/`

1. `01-initial-state.png` - Login/Dashboard loaded
2. `02-dashboard-loaded.png` - After authentication
3. `03-form-empty-state.png` - Empty Análisis IA form
4. `04-url-entered.png` - URL entered, button enabled
5. `05-loading-state-1.png` - Loading screen (initial)
6. `06-loading-state-2.png` - Loading screen (updated)
7. `07-error-state.png` - Error screen (backend down)
8. `08-error-detail.png` - Error message close-up

---

## Console Log

### Expected Errors (Acceptable):
```
✅ Error en el servicio de análisis de contenido: Error: El análisis falló
✅ 404 errors for favicon (acceptable)
```

### Unexpected Errors:
```
None
```

---

## Observations

- **Session Persistence**: ✅ Worked (already logged in)
- **Character Counter**: ✅ Accurate (88 characters)
- **Loading Animation**: ✅ Smooth and professional
- **Error Handling**: ✅ User-friendly Spanish message
- **Recovery Options**: ✅ Both buttons present

---

## Backend Status

⚠️ **AI Analysis Backend**: NOT CONFIGURED
**Impact**: Analysis fails (expected)
**Frontend Behavior**: ✅ Handles error gracefully

---

## Test Verdict

✅ **PASS** - All frontend features working correctly

**Reasoning**:
- All UI elements render properly
- Form validation works
- Loading states display correctly
- Error handling is professional and user-friendly
- Backend unavailability doesn't cause crashes

**Backend configuration needed for full E2E testing**.

---

**Report Generated**: YYYY-MM-DD HH:MM
**Report Location**: qa-reports/YYYY-MM-DD-HHMM/test-report.md
```

---

## 🔧 Troubleshooting

### Problem: Can't determine server port

**Solution**:
```bash
# Check Bash output for dev server
bashOutput('npm run dev')
# Look for: "Local:   http://localhost:XXXX/"
```

---

### Problem: Browser shows password warnings

**Solution**:
```javascript
// After login, wait and handle
wait(1)
if (dialogPresent) { press('Escape') }
```

---

### Problem: Page doesn't load

**Check**:
1. Is dev server running?
2. Is port correct?
3. Check terminal for errors
4. Try accessing URL manually

---

### Problem: Already logged in

**Solution**:
- This is fine! Skip to Step 3
- Or clear cookies: `localStorage.clear()`

---

### Problem: Screenshots not saving

**Check**:
1. Directory exists: `mkdir -p qa-reports/YYYY-MM-DD-HHMM`
2. Path is correct
3. Write permissions

---

## 📞 Emergency Contacts

### Development Team
- **GitHub Issues**: https://github.com/lordalex/botilito-prompt-figma/issues

### Database
- **Supabase Dashboard**: https://mdkswlgcqsmgfmcuorxq.supabase.co

---

**Last Updated**: 2025-11-15
**Document Version**: 2.0
**Maintained By**: QA Team

---

⚠️ **SECURITY REMINDER**: This document contains sensitive information. Never commit it to version control.
