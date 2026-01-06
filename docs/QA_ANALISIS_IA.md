# QA Guide: Análisis IA (AI Analysis Feature)

## Overview

This document provides comprehensive instructions for QA testing the **Análisis IA** (AI Analysis) feature in Botilito. Follow this guide to ensure consistent and thorough testing.

---

## Feature Description

The **Análisis IA** feature allows users to submit content (URLs, text, images, videos, or audio) for AI-powered disinformation analysis. The system:

1. Accepts content via URL or direct input
2. Processes the content through multiple AI analysis stages
3. Returns a comprehensive "Diagnóstico Desinfodémico" (Disinformation Diagnosis)

---

## Test Environment

| Setting | Value |
|---------|-------|
| **Dev Server** | http://localhost:3000 |
| **Start Command** | `npm run dev` |
| **Supabase Project** | mdkswlgcqsmgfmcuorxq |
| **Feature Tab** | "Análisis IA" (first tab in navigation) |

---

## Test Credentials

### Existing Account (for standard testing)
```
Email: la@lordalexand.co
Password: 12345678
```

### New Account Creation (for registration testing)
```
Email Pattern: la+{i}@lordalexand.co
Password: 12345678

Examples:
- la+1@lordalexand.co
- la+2@lordalexand.co
- la+3@lordalexand.co
(Increment {i} for each new test account)
```

---

## Test Input Guidelines

### For AI Analysis Testing
**IMPORTANT:** Ask the user to input links/content manually rather than automating input.

### For Other Testing (Login, Navigation, etc.)
Automation with Playwright is acceptable.

---

## Test Scenarios

### 1. Pre-Authentication Tests

#### 1.1 Invalid Session Handling
**Purpose:** Verify app handles expired/invalid tokens gracefully

**Steps:**
1. Clear localStorage or use browser with expired session
2. Navigate to http://localhost:3000
3. Observe behavior

**Expected Result:**
- App should NOT get stuck on "Cargando..."
- Should redirect to login page within 2-3 seconds

**Failure Indicators:**
- Infinite loading spinner
- Console error: `AuthApiError: Invalid Refresh Token`

---

### 2. Authentication Tests

#### 2.1 Login Flow
**Steps:**
1. Navigate to http://localhost:3000
2. Enter test credentials
3. Click "¡Pa' dentro!"

**Expected Result:**
- Successful login
- Redirect to main app or profile completion

#### 2.2 Session Persistence
**Steps:**
1. Login successfully
2. Close browser tab
3. Reopen http://localhost:3000

**Expected Result:**
- Session restored automatically
- No login required

---

### 3. AI Analysis Tests

#### 3.1 URL Analysis - News Article
**Steps:**
1. Login with test account
2. Navigate to "Análisis IA" tab
3. Ask user to paste a news URL in the textbox
4. Select "Vector de Transmisión" if required
5. Click "Iniciar Diagnóstico"
6. Wait for analysis to complete

**Expected Result:**
- Progress indicator shows stages (snapshot → analysis)
- Analysis completes without errors
- Results display with all sections populated

**Verify These Elements:**
| Element | Expected Behavior |
|---------|-------------------|
| Número de Caso | UUID displayed |
| Fecha de Análisis | Valid date format (e.g., "15/12/2025, 8:47:19 a. m.") |
| Tipo de Contenido | "Enlace Web" for URLs |
| Tema | Detected topic (e.g., "Política") |
| Región | Detected region (e.g., "América Latina") |
| Veredicto Final | Classification result |
| Marcadores Detectados | Count of markers found |
| Verificación de Hechos | Fact-check results |
| Evaluación de Búsqueda Web | Web search results |

#### 3.2 URL Analysis - Video Content
**Steps:**
1. Ask user to paste a video URL (e.g., CNN video)
2. Run analysis

**Expected Result:**
- Same as 3.1, adapted for video content

#### 3.3 Text Analysis
**Steps:**
1. Ask user to paste suspicious text directly
2. Run analysis

**Expected Result:**
- Type shows "Texto" instead of "Enlace Web"
- Analysis completes successfully

---

### 4. UI/UX Tests

#### 4.1 Date Display
**Purpose:** Verify dates are never "Invalid Date"

**Check Points:**
- Fecha de Análisis
- Verificado en (Fact Check section)

**Expected:** Valid formatted date or current date fallback

#### 4.2 Responsive Design
**Steps:**
1. Test at different viewport widths
2. Check mobile layout

#### 4.3 Share Buttons
**Steps:**
1. Complete an analysis
2. Click each share button (Twitter, Facebook, LinkedIn, WhatsApp)

**Expected:** Opens share dialog with pre-filled content

---

### 5. Error Handling Tests

#### 5.1 Invalid URL
**Steps:**
1. Enter malformed URL
2. Attempt analysis

**Expected:** Appropriate error message

#### 5.2 Network Failure
**Steps:**
1. Disconnect network mid-analysis
2. Observe behavior

**Expected:** Graceful error handling with retry option

---

## Known Issues & Limitations

### 1. Web Search Returns No Results
**Status:** Pending Investigation

**Symptom:**
- "Evaluación de Búsqueda Web" always shows:
  - Veredicto: "No se encontraron resultados."
  - Puntaje de Credibilidad: 0/100

**Impact:** Medium - affects fact-checking completeness

**Workaround:** None currently

### 2. AI Knowledge Cutoff
**Status:** By Design (AI Limitation)

**Symptom:**
- AI may flag accurate current events as misleading if they occurred after the model's training cutoff

**Example:**
- Kristi Noem flagged as not being Secretary of Homeland Security (she was appointed Jan 2025)

**Impact:** Can cause false positives on recent news

**Mitigation:** Consider this when evaluating AI verdicts on current events

### 3. Favicon 404
**Status:** Minor

**Symptom:**
- Console shows: `Failed to load resource: 404 (Not Found) @ /favicon.ico`

**Impact:** None - cosmetic only

---

## Console Errors to Monitor

### Critical (Block Release)
- `AuthApiError: Invalid Refresh Token` with stuck loading
- Any unhandled promise rejections
- React component crashes

### Warning (Log & Continue)
- 404 for favicon.ico
- Network timeouts (may be transient)

### Informational (Ignore)
- React DevTools recommendation
- Development mode warnings

---

## Checklist for Each Test Session

```
[ ] Dev server running on localhost:3000
[ ] Test account credentials available
[ ] Browser DevTools open (Console tab)
[ ] Network tab open for API monitoring
[ ] Clear localStorage if testing session handling
[ ] Document any new issues found
[ ] Take screenshots of failures
[ ] Note console errors
```

---

## Reporting Issues

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Console errors** (full stack trace)
5. **Network requests** (if API-related)
6. **Screenshots/recordings**
7. **Browser and OS**
8. **Branch tested**

---

## Test URLs for Analysis

These URLs have been used in testing:

| Source | URL | Notes |
|--------|-----|-------|
| El Tiempo | `eltiempo.com/justicia/delitos/...` | Politics/extraditions |
| CNN Español | `cnnespanol.cnn.com/video/kristi-noem-...` | Video content, triggered AI knowledge issue |

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-15 | 1.0 | Initial QA guide created |

---

## Contact

For questions about this QA guide, contact the development team.
