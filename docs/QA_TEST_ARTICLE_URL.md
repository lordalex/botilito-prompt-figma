# QA Test: Article URL Analysis

## Test ID: QA-URL-001
**Feature**: Article Analysis via URL Link
**Module**: Análisis IA
**Priority**: High

---

## Prerequisites

### Test Environment
- Local development server running (`npm run dev`)
- Application accessible at `http://localhost:5173`

### Test Account
```
Email: la@lordalexand.co
Password: 12345678
```

### Test URLs (use recent, accessible articles)
```
# Spanish news articles (recommended)
https://elpais.com/america/colombia/
https://www.eltiempo.com/
https://www.semana.com/

# Pick any recent article from these sites
```

---

## Test Case: Submit Article URL for Analysis

### Objective
Verify that users can submit an article URL and receive a complete AI analysis.

---

### Test Steps

#### Step 1: Access Application
1. Open browser and navigate to `http://localhost:5173`
2. Login with test credentials
3. Navigate to **"Análisis IA"** tab (should be default view)

**Expected Result:**
- [ ] Login successful
- [ ] "Análisis IA" tab is active
- [ ] Content upload form is displayed
- [ ] Form shows 5 capability badges: Enlaces, Texto, Imágenes, Videos, Audios

---

#### Step 2: Enter Article URL
1. In the text area, paste a valid article URL
   - Example: `https://elpais.com/america/colombia/2024-11-15/petro-anuncia-cambios-en-su-gabinete.html`
2. Observe the form behavior

**Expected Result:**
- [ ] URL appears in text area
- [ ] Character counter updates
- [ ] "Iniciar Diagnóstico" button becomes enabled

---

#### Step 3: Select Transmission Vector
1. Click the "Vector de Transmisión" dropdown
2. Select an option (e.g., "Web", "WhatsApp", "Telegram")

**Expected Result:**
- [ ] Dropdown displays all options
- [ ] Selected option is visible
- [ ] Button remains enabled

---

#### Step 4: Submit for Analysis
1. Click **"Iniciar Diagnóstico"** button
2. Observe loading state

**Expected Result:**
- [ ] Button shows loading state (disabled)
- [ ] Progress indicator appears
- [ ] Status messages update (e.g., "Procesando...", "Analizando contenido...")

---

#### Step 5: Verify Analysis Results
1. Wait for analysis to complete (may take 30-90 seconds)
2. Review the results displayed

**Expected Result:**
- [ ] Loading state ends
- [ ] Results view displays with:
  - [ ] Botilito banner (yellow background)
  - [ ] Summary card with credibility score (0-100)
  - [ ] Risk level indicator with appropriate color
  - [ ] Article title extracted from URL
  - [ ] Analysis sections available via tabs
  - [ ] Case code generated (format: `T-XX-YYYYMMDD-###`)

---

#### Step 6: Review Analysis Tabs
1. Click through each analysis tab:
   - **Resumen**: Summary of findings
   - **Análisis de Fuentes**: Source analysis and fact-checking
   - **Alertas**: Detected markers/warnings
   - **Competencias AMI**: Media literacy competencies

**Expected Result:**
- [ ] Each tab loads content
- [ ] Fact-check table displays (if applicable)
- [ ] Markers show with appropriate colors
- [ ] Recommendations section is visible

---

## Edge Cases to Test

### EC-1: Invalid URL
**Input:** `not-a-valid-url` or `htp://missing-letter.com`
**Expected:** Form should handle gracefully (may treat as text content)

### EC-2: Inaccessible URL
**Input:** `https://example.com/page-that-does-not-exist-404`
**Expected:** Error message displayed, graceful failure

### EC-3: Non-Article URL
**Input:** Homepage URL like `https://google.com`
**Expected:** Analysis attempts; results may indicate limited content

### EC-4: URL with Special Characters
**Input:** URL with query params `https://site.com/article?id=123&ref=test`
**Expected:** URL handled correctly, analysis proceeds

### EC-5: Very Long Article
**Input:** Long-form investigative article (5000+ words)
**Expected:** Analysis completes, may take longer

---

## Pass/Fail Criteria

### Pass Conditions
- User can submit a valid article URL
- Analysis completes within reasonable time (<2 minutes)
- Results display all expected sections
- Case code is generated correctly
- No console errors during process

### Fail Conditions
- Application crashes or freezes
- Infinite loading state
- Results don't display after successful API response
- Critical UI elements missing
- Unhandled errors shown to user

---

## Notes

- **Polling**: The system polls the backend every 2-3 seconds for status updates
- **Caching**: Previously analyzed URLs may return cached results faster
- **Backend**: Uses Supabase Edge Functions at `text-analysis-DTO/submit` endpoint

---

## Bug Report Template

If test fails, document:

```markdown
**Bug ID:** QA-URL-001-BUG-XXX
**Step:** [Which step failed]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**URL Tested:** [The article URL used]
**Screenshot:** [Attach if applicable]
**Console Errors:** [Copy any errors]
**Timestamp:** [Date/time of test]
```
